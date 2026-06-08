// Vídeos em destaque do YouTube.
//
// COMO ADICIONAR UM VÍDEO:
// 1. Abra o vídeo no YouTube e copie o ID (o trecho depois de "v=" na URL,
//    ex.: https://www.youtube.com/watch?v=ABC123  ->  id: "ABC123").
// 2. Adicione um item no array abaixo.
//
// Enquanto estiver vazio, a página "Na Mídia" mostra os dois canais em
// destaque (configurados em src/data/site.ts -> CANAIS_YOUTUBE).

export interface VideoDestaque {
  titulo: string;
  canal: string;
  id: string; // ID do YouTube
}

export const VIDEOS: VideoDestaque[] = [
  // Exemplo (descomente e troque o id):
  // { titulo: "Por que me pré-candidatei", canal: "Eduardo Reiner", id: "XXXXXXXXXXX" },
];
