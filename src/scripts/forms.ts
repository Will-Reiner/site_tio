// =====================================================================
// Integração dos formulários (LGPD + CRM) — PONTO ÚNICO DE INTEGRAÇÃO
// ---------------------------------------------------------------------
// Todos os formulários do site (Manual, Eventos, Lista de presença,
// Contato) passam por aqui. Por enquanto NÃO há CRM/e-mail configurado,
// então o lead é validado, o consentimento LGPD é registrado (data/hora,
// origem e versão do texto) e tudo é guardado localmente para não se
// perder. Quando o Brevo/RD Station estiver configurado, basta trocar o
// corpo de `enviarParaCRM()` (ou embutir o formulário nativo da
// ferramenta) — nada mais na UI precisa mudar.
// =====================================================================

// Versão do texto de consentimento. Trocar quando o texto LGPD mudar.
export const VERSAO_CONSENTIMENTO = "2026-07-lgpd-v1";

export interface RegistroLead {
  formulario: string; // origem: "manual" | "eventos" | "presenca" | "contato"
  aceiteLgpd: boolean;
  versaoConsentimento: string;
  dataHora: string; // ISO 8601
  dados: Record<string, unknown>;
}

// TODO(CRM): substituir por integração real (Brevo/RD Station) — chamada de
// API via função serverless OU troca deste formulário pelo form nativo
// embutido da ferramenta. Enquanto isso, guardamos o lead no navegador.
async function enviarParaCRM(reg: RegistroLead): Promise<void> {
  try {
    const CHAVE = "er_leads";
    const atuais = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    atuais.push(reg);
    localStorage.setItem(CHAVE, JSON.stringify(atuais));
  } catch {
    /* localStorage indisponível — ignora silenciosamente */
  }
  // eslint-disable-next-line no-console
  console.info("[formulário] lead registrado (pendente de envio ao CRM):", reg);
}

interface OpcoesLigar {
  form: HTMLFormElement;
  origem: string;
  // Chamado após registrar o lead com sucesso (redirecionar ou exibir tela).
  aoConcluir: (reg: RegistroLead) => void;
}

// Liga um <form> ao fluxo de envio: valida (inclui o checkbox required de
// consentimento), monta o registro e chama o CRM (stub) + o callback.
export function ligarFormulario({ form, origem, aoConcluir }: OpcoesLigar): void {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const dados: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      if (k === "consentimento") continue;
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

    try {
      await enviarParaCRM(reg);
      aoConcluir(reg);
    } finally {
      if (botao) {
        botao.disabled = false;
        botao.removeAttribute("aria-busy");
      }
    }
  });
}

// --- Liberação de acesso ao Manual (gate leve por localStorage) ---
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
