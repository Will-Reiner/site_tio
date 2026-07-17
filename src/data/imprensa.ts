// Aparições na imprensa. Para adicionar, copie um item e edite.
// "imagem" é opcional e usa uma chave mapeada na página Na Mídia
// (por enquanto só "entrevista", que aponta para a foto real).

export interface ItemImprensa {
  titulo: string;
  veiculo: string;
  data: string;
  url: string;
  resumo: string;
  imagem?: "entrevista" | "audiencia";
  destaque?: boolean;
  provisorio?: boolean;
}

export const IMPRENSA: ItemImprensa[] = [
  {
    titulo:
      "Audiência pública sobre o combate ao trabalho escravo contemporâneo",
    veiculo: "Câmara dos Deputados",
    data: "12 de maio de 2026",
    url: "https://www.camara.leg.br/evento-legislativo/81921",
    resumo:
      "Eduardo Reiner participa da audiência pública “Desafios do combate ao trabalho escravo contemporâneo no Brasil”, na Comissão de Direitos Humanos, Minorias e Igualdade Racial. Sua fala vai de 7min18 a 16min42.",
    imagem: "audiencia",
    destaque: true,
  },
];
