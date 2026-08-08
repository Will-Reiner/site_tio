// =====================================================================
// Worker do site — ÚNICO pedaço de servidor do projeto.
// ---------------------------------------------------------------------
// O site continua 100% estático: o wrangler.jsonc usa
// `run_worker_first: ["/api/*"]`, então este código só roda em /api/*.
// Qualquer outra rota é servida direto do dist/ pelos static assets.
//
// Responsabilidade única: receber os formulários do site (Guia, Eventos,
// Presença) e criar/atualizar o contato no Brevo, sem expor a chave de
// API no navegador.
//
// Fica fora de src/ de propósito, para o Astro não tentar processá-lo.
// O Wrangler compila o TypeScript sozinho (sem build step, sem
// nodejs_compat: só APIs Web padrão).
// =====================================================================

interface Env {
  // Binding dos arquivos estáticos (rede de segurança, ver fetch abaixo).
  ASSETS: { fetch(request: Request): Promise<Response> };
  // Secrets:  npx wrangler secret put NOME
  BREVO_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  // Vars públicas (wrangler.jsonc): IDs das listas do Brevo.
  BREVO_LISTA_GUIA: string;
  BREVO_LISTA_EVENTOS: string;
  BREVO_LISTA_PRESENCA: string;
}

// Cada formulário do site cai numa lista diferente no Brevo.
const LISTA_POR_FORMULARIO = {
  guia: "BREVO_LISTA_GUIA",
  eventos: "BREVO_LISTA_EVENTOS",
  presenca: "BREVO_LISTA_PRESENCA",
} as const;

type Formulario = keyof typeof LISTA_POR_FORMULARIO;

// Nome do campo isca (honeypot). Existe escondido em todos os formulários
// (src/components/Turnstile.astro): humano nunca preenche, robô que
// preenche formulário "às cegas" preenche.
const CAMPO_ISCA = "confirmacao_extra";

// Limite defensivo do corpo da requisição.
const LIMITE_CORPO = 8 * 1024;

interface Payload {
  formulario?: unknown;
  versaoConsentimento?: unknown;
  turnstileToken?: unknown;
  dados?: Record<string, unknown>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/lead") {
      if (request.method !== "POST") {
        return json({ ok: false, erro: "metodo" }, 405, { allow: "POST" });
      }
      return tratarLead(request, env);
    }

    // Só chega aqui se a Cloudflare encaminhar algo fora de /api/*.
    return env.ASSETS.fetch(request);
  },
};

// TODA recusa passa por aqui. Um lead descartado sem deixar rastro no
// `wrangler tail` é pior do que um erro visível: some sem ninguém notar,
// porque o visitante segue o fluxo normalmente de qualquer jeito.
function recusar(erro: string, motivo: string, status = 400): Response {
  console.error(`[lead] recusado (${erro}): ${motivo}`);
  return json({ ok: false, erro }, status);
}

async function tratarLead(request: Request, env: Env): Promise<Response> {
  const tamanho = Number(request.headers.get("content-length") || 0);
  if (tamanho > LIMITE_CORPO) {
    return recusar("tamanho", `content-length ${tamanho}`, 413);
  }

  let payload: Payload;
  try {
    const bruto = await request.text();
    if (bruto.length > LIMITE_CORPO) {
      return recusar("tamanho", `corpo com ${bruto.length} bytes`, 413);
    }
    payload = JSON.parse(bruto);
  } catch {
    return recusar("json", "corpo não é JSON válido");
  }

  const dados = (payload.dados ?? {}) as Record<string, unknown>;
  const formulario = texto(payload.formulario) as Formulario;

  // 1. Isca: responde sucesso sem chamar o Brevo. O robô vai embora achando
  //    que funcionou e a base fica limpa. Fica no log porque um humano
  //    caindo aqui (autopreenchimento do navegador, por exemplo) seria um
  //    lead perdido em silêncio.
  if (texto(dados[CAMPO_ISCA])) {
    console.warn(`[lead] isca preenchida em "${formulario}", descartado como robô`);
    return json({ ok: true });
  }

  // 2. Turnstile (captcha invisível da Cloudflare).
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const token = texto(payload.turnstileToken, 2048);
  const turnstile = await verificarTurnstile(token, ip, env);
  if (!turnstile.ok) {
    return recusar("turnstile", `${turnstile.motivo} (formulário "${formulario}")`);
  }

  // 3. Validação mínima. O resto dos campos é opcional em todos os formulários.
  if (!(formulario in LISTA_POR_FORMULARIO)) {
    return recusar("formulario", `valor inesperado: "${formulario}"`);
  }

  const email = texto(dados.email).toLowerCase();
  const nome = texto(dados.nome);
  if (!emailValido(email)) {
    return recusar("dados", `e-mail inválido em "${formulario}"`);
  }
  if (!nome) {
    return recusar("dados", `nome vazio em "${formulario}"`);
  }

  const listaId = Number(env[LISTA_POR_FORMULARIO[formulario]]);
  if (!Number.isFinite(listaId) || listaId <= 0) {
    console.error(
      `[lead] lista do formulário "${formulario}" não configurada no wrangler.jsonc`,
    );
    return json({ ok: false, erro: "config" }, 502);
  }

  // 4. Envio ao Brevo.
  const contato = {
    email,
    // updateEnabled é obrigatório: sem ele, quem já é contato (pegou o Guia e
    // depois se inscreveu num evento) volta erro "duplicate_parameter".
    // Com ele, o contato é atualizado e SOMADO à nova lista.
    updateEnabled: true,
    listIds: [listaId],
    attributes: montarAtributos(formulario, dados, payload, ip),
    // Nunca mandar emailBlacklisted: quem se descadastrou não pode voltar
    // sozinho para a base.
  };
  const temTelefone = CAMPOS_TELEFONE.some((c) => c in contato.attributes);

  try {
    let envio = await enviarAoBrevo(contato, env);

    // No Brevo, WHATSAPP e SMS são IDENTIFICADORES, como o e-mail. Cadastrar
    // alguém novo com um telefone que já pertence a outro contato falha com
    // um `404 document_not_found` enganoso ("Contact does not exist").
    // Acontece de verdade: casal que divide telefone, quem se cadastra com o
    // e-mail do trabalho e depois o pessoal, número digitado errado.
    // Perder a pessoa inteira por causa de um campo opcional seria burrice,
    // então repete sem o telefone e registra para você reconciliar depois.
    if (!envio.ok && temTelefone && conflitoDeTelefone(envio.detalhe)) {
      console.warn(
        `[lead] telefone de ${mascararEmail(email)} já pertence a outro contato no Brevo; ` +
          `recadastrando SEM o telefone (confira o duplicado no painel)`,
      );
      envio = await enviarAoBrevo(semTelefone(contato), env);
    }

    if (!envio.ok) {
      // Contexto do NOSSO lado do pedido, sem espalhar dado pessoal: sem
      // isso, um erro do Brevo vira um log que não dá para investigar.
      console.error(
        `[lead] Brevo recusou "${formulario}" (lista ${listaId}, ${envio.tentativas} tentativa(s)):\n` +
          `       resposta: ${envio.detalhe}\n` +
          `       enviamos: ${mascararEmail(email)} com [${Object.keys(contato.attributes).join(", ")}]`,
      );
      return json({ ok: false, erro: "brevo" }, 502);
    }
  } catch (e) {
    console.error(`[lead] falha ao chamar o Brevo em "${formulario}":`, e);
    return json({ ok: false, erro: "rede" }, 502);
  }

  // Linha de sucesso: no `wrangler tail`, silêncio deixou de significar
  // "deu certo". Sem e-mail no log, para não espalhar dado pessoal.
  console.log(`[lead] ok: contato de "${formulario}" enviado à lista ${listaId}`);
  return json({ ok: true });
}

// --- Brevo -----------------------------------------------------------

// Status transitórios que merecem uma segunda tentativa. Repetir é seguro
// porque, com `updateEnabled: true`, a chamada é idempotente.
// O 404 NÃO entra aqui: ele tem causa determinística e tratamento próprio
// (ver CAMPOS_TELEFONE abaixo), então repetir só dobraria a espera.
const STATUS_PARA_REPETIR = [408, 429, 500, 502, 503, 504];

async function enviarAoBrevo(
  contato: unknown,
  env: Env,
): Promise<{ ok: boolean; detalhe: string; tentativas: number }> {
  let detalhe = "";
  let feitas = 0;

  for (let tentativa = 1; tentativa <= 2; tentativa++) {
    feitas = tentativa;
    const resposta = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": env.BREVO_API_KEY,
      },
      body: JSON.stringify(contato),
    });

    if (resposta.ok) return { ok: true, detalhe: "", tentativas: tentativa };

    detalhe = `${resposta.status} ${await resposta.text()}`;
    if (tentativa === 2 || !STATUS_PARA_REPETIR.includes(resposta.status)) break;

    console.warn(`[lead] Brevo devolveu ${detalhe} — repetindo uma vez`);
    await new Promise((r) => setTimeout(r, 500));
  }

  return { ok: false, detalhe, tentativas: feitas };
}

// Atributos que o Brevo trata como identificador de contato, e não como
// dado solto: só um contato pode ter cada número.
const CAMPOS_TELEFONE = ["WHATSAPP", "SMS"];

type Contato = { attributes: Record<string, string | number | boolean> };

// O Brevo reclama de telefone repetido de duas formas diferentes, e uma
// delas mente descaradamente:
//   - com SMS no payload:  400 duplicate_parameter, duplicate_identifiers ["SMS"]
//   - só com WHATSAPP:     404 document_not_found, "Contact does not exist"
function conflitoDeTelefone(detalhe: string): boolean {
  if (detalhe.includes("document_not_found")) return true;
  return (
    detalhe.includes("duplicate_parameter") &&
    CAMPOS_TELEFONE.some((campo) => detalhe.includes(`"${campo}"`))
  );
}

function semTelefone<T extends Contato>(contato: T): T {
  const attributes = { ...contato.attributes };
  for (const campo of CAMPOS_TELEFONE) delete attributes[campo];
  return { ...contato, attributes };
}

// Log precisa de identificação suficiente para investigar, sem virar um
// depósito de e-mail de eleitor.
function mascararEmail(email: string): string {
  const [usuario, dominio] = email.split("@");
  return `${usuario.slice(0, 3)}***@${dominio}`;
}

// Os nomes aqui precisam existir como atributos na conta do Brevo:
// rode `node scripts/brevo-setup.mjs` uma vez para criá-los.
function montarAtributos(
  formulario: Formulario,
  dados: Record<string, unknown>,
  payload: Payload,
  ip: string,
): Record<string, string | number | boolean> {
  const attrs: Record<string, string | number | boolean> = {
    NOME: texto(dados.nome, 255),
    ORIGEM: texto(dados.origem, 255) || formulario,
    // Prova de consentimento: o checkbox é `required` no HTML, então só
    // chega aqui quem marcou. A data vem do relógio do servidor, não do
    // navegador.
    LGPD_ACEITE: true,
    LGPD_DATA: new Date().toISOString().slice(0, 10),
    LGPD_VERSAO: texto(payload.versaoConsentimento, 60),
  };

  // Em produção o CF-Connecting-IP sempre existe (o tráfego passa pela
  // Cloudflare). No wrangler dev ele não vem: melhor não gravar o atributo
  // do que gravá-lo vazio.
  atribuir(attrs, "LGPD_IP", ip);

  // O mesmo número vai para os DOIS campos de propósito. `WHATSAPP` é o que
  // o formulário pede; `SMS` é o campo nativo do Brevo, que alimenta a
  // coluna de telefone na listagem de contatos e as campanhas. Só o
  // WHATSAPP deixava o telefone invisível no painel.
  const whatsapp = normalizarWhatsapp(texto(dados.whatsapp));
  if (whatsapp) {
    attrs.WHATSAPP = whatsapp;
    attrs.SMS = whatsapp;
  }

  atribuir(attrs, "CIDADE_UF", dados.cidade_uf);
  // "profissao" (Guia) e "atuacao" (Presença) são a mesma informação.
  atribuir(attrs, "PROFISSAO", dados.profissao ?? dados.atuacao);
  atribuir(attrs, "FAIXA_ETARIA", dados.faixa_etaria);
  atribuir(attrs, "TEMA_INTERESSE", dados.tema_interesse);
  atribuir(attrs, "EVENTO", dados.evento);
  atribuir(attrs, "COMO_SOUBE", dados.como_soube);

  const quantidade = Number(texto(dados.quantidade));
  if (Number.isFinite(quantidade) && quantidade > 0) {
    attrs.QUANTIDADE_CONVITES = Math.min(quantidade, 100);
  }

  // Checkbox: o navegador só envia o campo quando está marcado.
  if (formulario === "presenca") {
    attrs.DESEJA_CERTIFICADO = dados.deseja_certificado != null;
  }

  return attrs;
}

function atribuir(
  attrs: Record<string, string | number | boolean>,
  chave: string,
  valor: unknown,
): void {
  const v = texto(valor, 255);
  if (v) attrs[chave] = v;
}

// --- Turnstile -------------------------------------------------------

// Devolve o motivo junto com o veredito: sem os "error-codes" da Cloudflare
// é impossível distinguir "token expirou" de "secret errada" olhando o log.
async function verificarTurnstile(
  token: string,
  ip: string,
  env: Env,
): Promise<{ ok: boolean; motivo: string }> {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, motivo: "TURNSTILE_SECRET_KEY não configurado no Worker" };
  }
  if (!token) {
    return {
      ok: false,
      motivo: "token vazio (o widget não terminou o desafio antes do envio)",
    };
  }

  const corpo = new FormData();
  corpo.append("secret", env.TURNSTILE_SECRET_KEY);
  corpo.append("response", token);
  if (ip) corpo.append("remoteip", ip);

  try {
    const resposta = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body: corpo },
    );
    const resultado = (await resposta.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    if (resultado.success === true) return { ok: true, motivo: "" };
    const codigos = resultado["error-codes"] || [];
    return {
      ok: false,
      motivo: `siteverify recusou: ${codigos.join(", ") || "sem error-codes"}`,
    };
  } catch (e) {
    return { ok: false, motivo: `falha de rede ao chamar o siteverify: ${e}` };
  }
}

// --- Utilidades ------------------------------------------------------

function texto(valor: unknown, limite = 200): string {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

// Aceita o que o brasileiro digita ("(11) 98888-7777") e devolve E.164.
// Se não parecer um telefone brasileiro plausível, devolve vazio: não vale
// perder o cadastro por causa de um campo opcional mal preenchido.
function normalizarWhatsapp(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length === 10 || digitos.length === 11) return `+55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    return `+${digitos}`;
  }
  return "";
}

function json(
  corpo: unknown,
  status = 200,
  cabecalhos: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...cabecalhos,
    },
  });
}
