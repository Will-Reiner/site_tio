// Eventos da agenda (pré-campanha / campanha).
// Comece VAZIO — sem dados de teste. Para publicar um evento, adicione um
// objeto ao array EVENTOS abaixo. A página de Eventos e a retirada de convite
// se ajustam sozinhas.
export interface Evento {
  slug: string; // identificador curto e único (usado no formulário e no QR)
  nome: string;
  data: string; // ex.: "12 de agosto de 2026"
  horario: string; // ex.: "19h"
  cidade: string; // ex.: "Curitiba / PR"
  local: string; // ex.: "Espaço Cultural — Rua X, 100"
  descricao: string; // uma ou duas frases
  encerrado?: boolean; // marque true para eventos já realizados
}

export const EVENTOS: Evento[] = [
  // Exemplo (descomente e edite quando houver um evento real):
  // {
  //   slug: "encontro-curitiba-ago26",
  //   nome: "Encontro pelo Trabalho Digno",
  //   data: "12 de agosto de 2026",
  //   horario: "19h",
  //   cidade: "Curitiba / PR",
  //   local: "Espaço Cultural — Rua X, 100",
  //   descricao:
  //     "Uma conversa aberta sobre trabalho, direitos e o futuro do Paraná.",
  // },
];
