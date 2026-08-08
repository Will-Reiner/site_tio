#!/usr/bin/env node
// =====================================================================
// Setup da conta Brevo — roda UMA vez (mas é idempotente, pode repetir).
// ---------------------------------------------------------------------
// O Brevo IGNORA silenciosamente (ou rejeita com "invalid_parameter")
// qualquer atributo que não exista previamente na conta. Este script:
//
//   1. lê os atributos que já existem;
//   2. cria só os que faltam, com o tipo certo;
//   3. imprime as listas com seus IDs, prontas para colar no wrangler.jsonc.
//
// Com a flag --criar-listas, também cria as três listas do site (uma por
// formulário) se ainda não existirem. Sem a flag, o script não escreve
// nenhuma lista na conta.
//
// A chave da API vem do arquivo .dev.vars (o mesmo que o Wrangler usa no
// desenvolvimento local, e que está no .gitignore). Basta rodar:
//
//   node scripts/brevo-setup.mjs
//
// Se preferir não guardar a chave em arquivo nenhum, dá para passá-la só
// para este comando:
//   PowerShell:  $env:BREVO_API_KEY = 'xkeysib-...'; node scripts/brevo-setup.mjs
//   bash:        BREVO_API_KEY=xkeysib-... node scripts/brevo-setup.mjs
//
// Nada aqui entra no build do site: é um utilitário de linha de comando.
// =====================================================================

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const API = "https://api.brevo.com/v3";
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

// Lê uma variável do .dev.vars sem depender de nenhuma dependência nova.
// Aceita as três formas:  NOME=valor  |  NOME="valor"  |  NOME='valor'
function lerDevVars(nome) {
  try {
    const conteudo = readFileSync(join(RAIZ, ".dev.vars"), "utf8");
    const linha = conteudo
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith(`${nome}=`));
    if (!linha) return "";
    return linha.slice(linha.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    return "";
  }
}

const CHAVE = process.env.BREVO_API_KEY || lerDevVars("BREVO_API_KEY");

if (!CHAVE) {
  console.error(
    "Não encontrei a chave da API do Brevo.\n\n" +
      "Jeito mais simples: abra o arquivo .dev.vars na raiz do projeto e preencha\n" +
      '  BREVO_API_KEY="xkeysib-..."\n' +
      "(se o arquivo não existir, copie o .dev.vars.example para .dev.vars).\n\n" +
      "Alternativa, sem salvar em arquivo:\n" +
      "  PowerShell: $env:BREVO_API_KEY = 'xkeysib-...'; node scripts/brevo-setup.mjs\n" +
      "  bash:       BREVO_API_KEY=xkeysib-... node scripts/brevo-setup.mjs",
  );
  process.exit(1);
}

// Atributos usados pelos formulários do site (worker/index.ts monta o
// payload com exatamente estes nomes). Só maiúsculas, dígitos e underscore.
const ATRIBUTOS = [
  ["NOME", "text", "Nome completo informado no formulário"],
  ["WHATSAPP", "text", "WhatsApp em formato internacional (+55...)"],
  ["SMS", "text", "Mesmo número do WhatsApp, no campo nativo do Brevo"],
  ["CIDADE_UF", "text", "Cidade e estado"],
  ["PROFISSAO", "text", "Profissão, entidade ou área de atuação"],
  ["FAIXA_ETARIA", "text", "Faixa etária (Guia)"],
  ["TEMA_INTERESSE", "text", "Tema trabalhista de interesse (Guia)"],
  ["EVENTO", "text", "Nome do evento (convite ou presença)"],
  ["QUANTIDADE_CONVITES", "float", "Convites solicitados"],
  ["COMO_SOUBE", "text", "Como soube do evento"],
  ["DESEJA_CERTIFICADO", "boolean", "Quer receber certificado do evento"],
  ["ORIGEM", "text", "Formulário/origem do último cadastro"],
  ["LGPD_ACEITE", "boolean", "Marcou o aceite de consentimento"],
  ["LGPD_DATA", "date", "Data do aceite"],
  ["LGPD_VERSAO", "text", "Versão do texto de consentimento aceito"],
  ["LGPD_IP", "text", "IP de origem do aceite (prova de consentimento)"],
];

async function brevo(caminho, opcoes = {}) {
  const resposta = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": CHAVE,
      ...opcoes.headers,
    },
  });
  const texto = await resposta.text();
  const corpo = texto ? JSON.parse(texto) : null;
  if (!resposta.ok) {
    const erro = new Error(
      `${opcoes.method || "GET"} ${caminho} → ${resposta.status} ${texto}`,
    );
    erro.status = resposta.status;
    erro.corpo = corpo;
    throw erro;
  }
  return corpo;
}

async function sincronizarAtributos() {
  console.log("\n== Atributos de contato ==");
  const { attributes = [] } = await brevo("/contacts/attributes");
  const existentes = new Set(attributes.map((a) => a.name.toUpperCase()));

  for (const [nome, tipo, descricao] of ATRIBUTOS) {
    if (existentes.has(nome)) {
      console.log(`  já existe   ${nome}`);
      continue;
    }
    try {
      await brevo(`/contacts/attributes/normal/${nome}`, {
        method: "POST",
        body: JSON.stringify({ type: tipo }),
      });
      console.log(`  criado      ${nome} (${tipo}) — ${descricao}`);
    } catch (e) {
      console.error(`  FALHOU      ${nome}: ${e.message}`);
    }
  }
}

// Uma lista por formulário do site. O nome da var é o que o Worker lê
// (ver LISTA_POR_FORMULARIO em worker/index.ts).
const LISTAS = [
  ["Guia Trabalhista", "BREVO_LISTA_GUIA"],
  ["Eventos", "BREVO_LISTA_EVENTOS"],
  ["Presença", "BREVO_LISTA_PRESENCA"],
];

async function buscarListas() {
  const { lists = [] } = await brevo("/contacts/lists?limit=50&offset=0");
  return lists;
}

// Só roda com a flag --criar-listas, para o script não mexer na conta do
// cliente por acidente. Não cria nada que já exista com o mesmo nome.
async function criarListas() {
  console.log("\n== Criando as listas que faltam ==");
  const existentes = await buscarListas();
  const porNome = new Map(existentes.map((l) => [l.name.toLowerCase(), l]));

  // O Brevo exige uma pasta; usa a primeira que houver na conta.
  const { folders = [] } = await brevo("/contacts/folders?limit=50&offset=0");
  if (folders.length === 0) {
    console.error(
      "  Nenhuma pasta de contatos na conta. Crie uma em Contatos → Listas → Pastas e rode de novo.",
    );
    return;
  }
  const pasta = folders[0];
  console.log(`  pasta: "${pasta.name}" (id ${pasta.id})`);

  for (const [nome] of LISTAS) {
    if (porNome.has(nome.toLowerCase())) {
      console.log(`  já existe   ${nome}`);
      continue;
    }
    try {
      const { id } = await brevo("/contacts/lists", {
        method: "POST",
        body: JSON.stringify({ name: nome, folderId: pasta.id }),
      });
      console.log(`  criada      ${nome} (id ${id})`);
    } catch (e) {
      console.error(`  FALHOU      ${nome}: ${e.message}`);
    }
  }
}

async function listarListas() {
  console.log("\n== Listas da conta ==");
  const lists = await buscarListas();
  if (lists.length === 0) console.log("  Nenhuma lista encontrada.");
  for (const lista of lists) {
    console.log(
      `  id ${String(lista.id).padStart(3)}  ${lista.name}  (${lista.totalSubscribers ?? 0} contatos)`,
    );
  }

  const porNome = new Map(lists.map((l) => [l.name.toLowerCase(), l]));
  const encontradas = LISTAS.map(([nome, chave]) => [
    chave,
    porNome.get(nome.toLowerCase()),
  ]);

  if (encontradas.every(([, lista]) => lista)) {
    console.log('\n  Cole este bloco em "vars", no wrangler.jsonc:\n');
    console.log('  "vars": {');
    console.log(
      encontradas
        .map(([chave, lista]) => `    "${chave}": "${lista.id}"`)
        .join(",\n"),
    );
    console.log("  }");
  } else {
    const faltando = encontradas
      .filter(([, lista]) => !lista)
      .map(([chave]) => LISTAS.find(([, c]) => c === chave)[0]);
    console.log(
      `\n  Faltam as listas: ${faltando.join(", ")}.\n` +
        "  Rode com a flag para criá-las:  node scripts/brevo-setup.mjs --criar-listas",
    );
  }
}

try {
  await sincronizarAtributos();
  if (process.argv.includes("--criar-listas")) await criarListas();
  await listarListas();
  console.log("\nPronto.\n");
} catch (e) {
  console.error(`\nErro: ${e.message}\n`);
  process.exit(1);
}
