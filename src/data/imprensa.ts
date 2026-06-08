// Aparições na imprensa. Para adicionar, copie um item e edite.
// "imagem" é opcional e usa uma chave mapeada na página Na Mídia
// (por enquanto só "entrevista", que aponta para a foto real).

export interface ItemImprensa {
  titulo: string;
  veiculo: string;
  data: string;
  url: string;
  resumo: string;
  imagem?: "entrevista";
  destaque?: boolean;
  provisorio?: boolean;
}

export const IMPRENSA: ItemImprensa[] = [
  {
    titulo: "“O auditor fiscal protege quem trabalha”",
    veiculo: "G1 · RBS TV",
    data: "2024", // TODO: data real
    url: "#", // TODO: link da matéria
    resumo:
      "Em entrevista, Eduardo Reiner explica o papel da inspeção do trabalho na proteção de direitos e na segurança de quem está no batente.",
    imagem: "entrevista",
    destaque: true,
    provisorio: true,
  },
  {
    titulo: "Especialista comenta segurança e saúde no trabalho",
    veiculo: "Veículo de imprensa", // TODO
    data: "2024",
    url: "#",
    resumo:
      "Participação debatendo prevenção de acidentes e a importância da fiscalização para empresas e trabalhadores.",
    provisorio: true,
  },
  {
    titulo: "Artigo: o trabalho que sustenta o Brasil",
    veiculo: "Coluna / Portal", // TODO
    data: "2024",
    url: "#",
    resumo:
      "Texto de opinião sobre valorização do trabalho, geração de renda e o futuro do emprego no país.",
    provisorio: true,
  },
];
