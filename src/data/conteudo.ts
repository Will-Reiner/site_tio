// =====================================================================
// TEXTOS PROVISÓRIOS — edite tudo aqui quando as copys finais chegarem.
// Mantido separado da configuração (site.ts) para facilitar a revisão.
// Nada aqui é definitivo: são textos de rascunho para dar forma ao site.
// =====================================================================

export const HERO = {
  // Linha manuscrita (fonte Caveat) que deixa clara a candidatura, no lugar
  // do antigo selo "Pré-candidato a Deputado Federal".
  assinatura: "pré-candidato a deputado federal",
  // O título é dividido para destacar parte dele em rosa no site.
  titulo: "Defender o trabalho",
  destaque: "é defender o Brasil.",
  subtitulo:
    "Sou Eduardo Reiner, auditor fiscal do trabalho. Há mais de 15 anos fiscalizo, protejo e conheço de perto a realidade de quem constrói o país. Agora, quero levar essa luta para a Câmara dos Deputados.",
};

// Vídeo de apresentação na home (antes de "Quem sou eu"). Cole o ID do
// YouTube — o trecho depois de "v=" na URL — quando o vídeo estiver pronto.
// Enquanto estiver vazio, a home mostra um espaço reservado para o vídeo.
export const VIDEO_APRESENTACAO = {
  id: "", // TODO: ID do vídeo do YouTube
  titulo: "Eduardo Reiner explica a campanha",
};

// Bloco de números — TROQUE pelos dados reais. Os valores abaixo são
// apenas exemplos para dar forma à seção.
export const NUMEROS = [
  { valor: "2", rotulo: "canais no YouTube com informação séria" },
  { valor: "Milhares", rotulo: "de pessoas formadas pela Imersão AFT" },
  // TODO: confirme o número de anos de carreira.
  { valor: "+15 anos", rotulo: "dedicados à defesa do trabalho no Brasil" },
];

// Pilares de quem ele é — fatos qualitativos (ajuste à vontade).
export const PILARES = [
  {
    titulo: "Auditor fiscal do trabalho",
    texto:
      "Conhece por dentro as leis que protegem quem trabalha — e sabe exatamente onde elas precisam mudar.",
    icone: "check",
  },
  {
    titulo: "Educador",
    texto:
      "No Imersão AFT, ajudou a formar e inspirar milhares de pessoas que sonham em servir o país.",
    icone: "estrela",
  },
  {
    titulo: "Voz pública",
    texto:
      "Leva informação séria sobre trabalho, direitos e cidadania para as redes e para a imprensa.",
    icone: "play",
  },
];

// Citação de destaque (pull quote).
export const CITACAO = {
  texto:
    "Passei a carreira fiscalizando o trabalho bem de perto. Vi o que funciona, o que precisa mudar — e por que ninguém pode ficar de fora dessa conversa.",
  autor: "Eduardo Reiner",
};

// Resumo "Quem sou eu" na home (2 parágrafos curtos, em primeira pessoa).
export const SOBRE_HOME = [
  "Sou filho do trabalho e movido por ele. Construí minha trajetória como auditor fiscal do trabalho — a carreira de quem garante que a lei chegue ao chão de fábrica, ao canteiro de obras e a cada local onde alguém ganha a vida.",
  "Dessa experiência nasceu também o educador: no Imersão AFT, transformei conhecimento técnico em oportunidade para milhares de pessoas. Agora, levo tudo isso para uma nova missão — representar quem trabalha no Congresso Nacional.",
];

// Frases curtas que rodam na faixa em movimento (marquee).
export const FRASES_MARQUEE = [
  "Trabalho digno",
  "Fiscalização que protege",
  "Renda para quem produz",
  "Educação e oportunidade",
  "O Brasil que constrói",
];
