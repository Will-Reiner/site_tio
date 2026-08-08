// =====================================================================
// Integração dos formulários (LGPD + CRM) — PONTO ÚNICO DE INTEGRAÇÃO
// ---------------------------------------------------------------------
// Todos os formulários do site (Guia, Eventos, Lista de presença) passam
// por aqui. O lead é validado, o consentimento LGPD é registrado
// (data/hora, origem e versão do texto) e tudo é enviado para o endpoint
// /api/lead, que fala com o Brevo do lado do servidor (worker/index.ts).
//
// Regra de ouro: uma falha do CRM NUNCA impede a pessoa de seguir. Se o
// envio falhar, o lead fica guardado no localStorage e o erro vai para o
// console; o `aoConcluir` roda do mesmo jeito.
// =====================================================================

// Versão do texto de consentimento. Trocar quando o texto LGPD mudar.
export const VERSAO_CONSENTIMENTO = "2026-07-lgpd-v1";

// Endpoint servido pelo Worker (ver `run_worker_first` no wrangler.jsonc).
const ENDPOINT = "/api/lead";

// Campos de controle que não fazem parte dos dados do lead.
const CAMPOS_INTERNOS = ["consentimento", "cf-turnstile-response"];

// Nome do campo isca (honeypot) escondido em cada formulário pelo
// componente Turnstile.astro. Vai junto com os dados de propósito: quem
// valida é o Worker (worker/index.ts).
export const CAMPO_ISCA = "confirmacao_extra";

declare global {
  interface Window {
    turnstile?: { reset: (widget?: HTMLElement | string) => void };
  }
}

export interface RegistroLead {
  formulario: string; // origem: "guia" | "eventos" | "presenca"
  aceiteLgpd: boolean;
  versaoConsentimento: string;
  dataHora: string; // ISO 8601
  dados: Record<string, unknown>;
}

// Guarda o lead no navegador quando o envio falha, para não se perder.
function guardarLocalmente(reg: RegistroLead): void {
  try {
    const CHAVE = "er_leads_pendentes";
    const atuais = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    atuais.push(reg);
    localStorage.setItem(CHAVE, JSON.stringify(atuais));
  } catch {
    /* localStorage indisponível — ignora silenciosamente */
  }
}

// Envia o lead ao Worker, que cria/atualiza o contato no Brevo.
// Devolve true em caso de sucesso; nunca lança.
async function enviarParaCRM(
  reg: RegistroLead,
  turnstileToken: string,
): Promise<boolean> {
  try {
    const resposta = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...reg, turnstileToken }),
      keepalive: true,
    });
    const corpo = (await resposta.json().catch(() => null)) as {
      ok?: boolean;
      erro?: string;
    } | null;

    if (resposta.ok && corpo?.ok) return true;

    // eslint-disable-next-line no-console
    console.error(
      `[formulário] envio recusado (${resposta.status}${corpo?.erro ? ` / ${corpo.erro}` : ""}) — lead guardado localmente.`,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[formulário] falha de rede — lead guardado localmente.", e);
  }

  guardarLocalmente(reg);
  return false;
}

// O token do Turnstile é de uso único e expira em 5 minutos. Sem este
// reset, um segundo envio na mesma sessão (ex.: reabrir o modal de
// eventos) seria recusado pelo Worker. Chamado depois de cada envio e,
// no caso do modal, também ao abrir.
export function resetarTurnstile(form: HTMLFormElement): void {
  const widget = form.querySelector<HTMLElement>(".cf-turnstile");
  if (widget) window.turnstile?.reset(widget);
}

function lerToken(form: HTMLFormElement): string {
  return String(new FormData(form).get("cf-turnstile-response") || "");
}

// O desafio roda sozinho ao carregar a página, mas quem preenche rápido
// pode clicar em enviar antes de ele terminar. Sem esta espera o token vai
// vazio, o Worker recusa e o lead some sem ninguém perceber.
async function esperarToken(form: HTMLFormElement, ms = 4000): Promise<string> {
  const limite = Date.now() + ms;
  let token = lerToken(form);
  while (!token && Date.now() < limite) {
    await new Promise((r) => setTimeout(r, 200));
    token = lerToken(form);
  }
  return token;
}

// Com `interaction-only`, o widget tem altura zero enquanto a Cloudflare
// não precisa de nada. Se ele ocupa espaço, é porque está pedindo o clique
// da pessoa. Altura zero + token ausente significa outra coisa (script
// bloqueado por extensão, rede corporativa), e aí não vale travar ninguém.
function widgetPedindoInteracao(form: HTMLFormElement): boolean {
  const widget = form.querySelector<HTMLElement>(".cf-turnstile");
  return !!widget && widget.getBoundingClientRect().height > 0;
}

function mostrarAviso(form: HTMLFormElement, visivel: boolean): void {
  const aviso = form.querySelector<HTMLElement>("[data-turnstile-aviso]");
  if (aviso) aviso.hidden = !visivel;
}

interface OpcoesLigar {
  form: HTMLFormElement;
  origem: string;
  // Chamado após o envio (redirecionar ou exibir tela de sucesso). Roda
  // mesmo se o CRM falhar, de propósito.
  aoConcluir: (reg: RegistroLead) => void;
}

// Liga um <form> ao fluxo de envio: valida (inclui o checkbox required de
// consentimento), monta o registro e manda para o /api/lead + o callback.
export function ligarFormulario({ form, origem, aoConcluir }: OpcoesLigar): void {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const dados: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (CAMPOS_INTERNOS.includes(k)) continue;
      // Campos multivalor (checkbox de áreas) viram array.
      if (k in dados) {
        const atual = dados[k];
        dados[k] = Array.isArray(atual) ? [...atual, v] : [atual, v];
      } else {
        dados[k] = v;
      }
    }

    const reg: RegistroLead = {
      formulario: origem,
      aceiteLgpd: true, // o checkbox é required; só chega aqui se marcado
      versaoConsentimento: VERSAO_CONSENTIMENTO,
      dataHora: new Date().toISOString(),
      dados,
    };

    const botao = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (botao) {
      botao.disabled = true;
      botao.setAttribute("aria-busy", "true");
    }
    mostrarAviso(form, false);

    let enviou = false;
    try {
      const turnstileToken = await esperarToken(form);

      // Sem token E com o desafio visível na tela: a pessoa ainda não
      // clicou. Pedir o clique é melhor do que enviar e perder o cadastro.
      if (!turnstileToken && widgetPedindoInteracao(form)) {
        mostrarAviso(form, true);
        return;
      }

      // Sem token e sem desafio visível (Turnstile bloqueado no navegador):
      // segue assim mesmo. Travar quem não consegue carregar o widget seria
      // pior do que perder o lead, que fica guardado no localStorage.
      enviou = true;
      await enviarParaCRM(reg, turnstileToken);
      aoConcluir(reg);
    } finally {
      // Só reinicia o widget se o token foi de fato consumido. Reiniciá-lo
      // enquanto a pessoa está no meio do desafio apagaria o clique dela.
      if (enviou) resetarTurnstile(form);
      if (botao) {
        botao.disabled = false;
        botao.removeAttribute("aria-busy");
      }
    }
  });
}

// --- Liberação de acesso ao Guia (gate leve por localStorage) ---
const CHAVE_MANUAL = "er_manual_liberado";

export function liberarManual(): void {
  try {
    localStorage.setItem(CHAVE_MANUAL, "1");
  } catch {
    /* ignora */
  }
}

export function temAcessoManual(): boolean {
  try {
    return localStorage.getItem(CHAVE_MANUAL) === "1";
  } catch {
    return false;
  }
}
