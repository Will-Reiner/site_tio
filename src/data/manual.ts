// =====================================================================
// Base do Manual de Direitos Trabalhistas
// ---------------------------------------------------------------------
// Lê e faz o parse de `base.md` (raiz do repo) EM TEMPO DE BUILD. O arquivo
// `base.md` continua sendo a ÚNICA fonte da verdade das 197 perguntas — este
// módulo apenas o transforma numa estrutura tipada (módulos → perguntas) que
// o app do Manual consome. Editou base.md? Rode `npm run build` e o app
// atualiza sozinho.
// =====================================================================
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export interface Pergunta {
  id: string;
  pergunta: string;
  tema?: string;
  resposta: string;
  fundamento?: string;
  fontes: string[];
  encaminhamento?: string;
  jurisprudencia?: string;
}

export interface Modulo {
  nome: string;
  slug: string;
  perguntas: Pergunta[];
}

// slug sem acento, minúsculo, só letras/números e hífens.
function paraSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function lerBaseMd(): string {
  // Em `astro build`/`dev` o cwd é a raiz do projeto, onde vive base.md.
  const candidatos = [
    join(process.cwd(), "base.md"),
    fileURLToPath(new URL("../../base.md", import.meta.url)),
  ];
  for (const caminho of candidatos) {
    try {
      return readFileSync(caminho, "utf-8");
    } catch {
      /* tenta o próximo */
    }
  }
  throw new Error(
    "Não foi possível localizar base.md (procurei em: " +
      candidatos.join(", ") +
      ")",
  );
}

// Mapa "rótulo em base.md" → chave interna da pergunta.
const CAMPOS: Record<string, keyof Pergunta | "fontes"> = {
  Tema: "tema",
  Resposta: "resposta",
  "Fundamento legal": "fundamento",
  "Fonte(s)": "fontes",
  Encaminhamento: "encaminhamento",
  "Jurisprudência/precedente": "jurisprudencia",
};

function parseBase(md: string): Modulo[] {
  const linhas = md.split(/\r?\n/);
  const modulos: Modulo[] = [];
  let moduloAtual: Modulo | null = null;
  let perguntaAtual: (Pergunta & { _fontesRaw?: string }) | null = null;
  let campoAtual: string | null = null; // chave interna sendo preenchida

  const finalizarPergunta = () => {
    if (perguntaAtual && moduloAtual) {
      const fontes = (perguntaAtual._fontesRaw || "")
        .split(/;\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      delete perguntaAtual._fontesRaw;
      perguntaAtual.fontes = fontes;
      moduloAtual.perguntas.push(perguntaAtual);
    }
    perguntaAtual = null;
    campoAtual = null;
  };

  for (const linha of linhas) {
    // Módulo: "## Nome" (menos "## Resumo por módulo" e o título "# ...")
    const mMod = linha.match(/^##\s+(?!#)(.+?)\s*$/);
    if (mMod && !/^###/.test(linha)) {
      const nome = mMod[1].trim();
      if (nome.toLowerCase().startsWith("resumo por m")) {
        continue; // seção de resumo — ignora
      }
      finalizarPergunta();
      moduloAtual = { nome, slug: paraSlug(nome), perguntas: [] };
      modulos.push(moduloAtual);
      continue;
    }

    // Pergunta: "### DT-037 — Pergunta?"
    const mPerg = linha.match(/^###\s+(DT-[\w.]+)\s+[—–-]\s+(.+?)\s*$/);
    if (mPerg && moduloAtual) {
      finalizarPergunta();
      perguntaAtual = {
        id: mPerg[1].trim(),
        pergunta: mPerg[2].trim(),
        resposta: "",
        fontes: [],
      };
      campoAtual = null;
      continue;
    }

    // Separador de item
    if (/^---\s*$/.test(linha)) {
      campoAtual = null;
      continue;
    }

    // Campo: "**Rótulo:** valor"
    const mCampo = linha.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (mCampo && perguntaAtual) {
      const rotulo = mCampo[1].trim();
      const valor = mCampo[2].trim();
      const chave = CAMPOS[rotulo];
      if (chave === "fontes") {
        perguntaAtual._fontesRaw = valor;
        campoAtual = "_fontesRaw";
      } else if (chave) {
        (perguntaAtual as Record<string, unknown>)[chave] = valor;
        campoAtual = chave;
      } else {
        campoAtual = null; // rótulo desconhecido — ignora continuações
      }
      continue;
    }

    // Continuação de um campo multi-linha
    if (perguntaAtual && campoAtual && linha.trim() !== "") {
      const anterior =
        (perguntaAtual as Record<string, unknown>)[campoAtual] || "";
      (perguntaAtual as Record<string, unknown>)[campoAtual] =
        `${anterior} ${linha.trim()}`.trim();
      continue;
    }

    // Linha em branco encerra o campo corrente (mas mantém a pergunta aberta)
    if (linha.trim() === "") {
      campoAtual = null;
    }
  }
  finalizarPergunta();

  // Só módulos com perguntas de verdade.
  return modulos.filter((m) => m.perguntas.length > 0);
}

export const MODULOS: Modulo[] = parseBase(lerBaseMd());

export const TOTAL_PERGUNTAS = MODULOS.reduce(
  (acc, m) => acc + m.perguntas.length,
  0,
);
