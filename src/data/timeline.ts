// Linha do tempo da Minha História.
// Onde não há data confirmada pelo cliente, o marco usa um rótulo de período e
// fica com `provisorio: true` (aguardando confirmação de datas exatas).
export interface MarcoTempo {
  ano: string; // ano ou rótulo curto de período
  titulo: string;
  texto: string;
  provisorio?: boolean;
}

export const LINHA_DO_TEMPO: MarcoTempo[] = [
  {
    ano: "Carreira",
    titulo: "Auditor fiscal do trabalho",
    texto:
      "Início de quase duas décadas na linha de frente da fiscalização, protegendo direitos de quem trabalha.",
    provisorio: true,
  },
  {
    ano: "Formação",
    titulo: "Dois mestrados em Direito",
    texto:
      "Especialização acadêmica, com uma das titulações realizada na Espanha, unindo rigor técnico à ação na ponta.",
    provisorio: true,
  },
  {
    ano: "2012",
    titulo: "Ao lado de Marina Silva",
    texto:
      "Coordena a campanha de Marina no Paraná e é coordenador-geral da Rede Sustentabilidade; candidato a deputado federal.",
  },
  {
    ano: "2016",
    titulo: "Política construída com as pessoas",
    texto:
      "Nas ruas de Curitiba pela Rede, defendendo uma forma diferente de fazer política, mais próxima da vida real.",
  },
  {
    ano: "Atuação nacional",
    titulo: "Combate ao trabalho infantil e escravo",
    texto:
      "Coordena o grupo móvel de combate ao trabalho infantil e o planejamento estratégico nacional de combate ao trabalho escravo.",
    provisorio: true,
  },
  {
    ano: "No Paraná",
    titulo: "Todas as chefias da auditoria",
    texto:
      "Ao longo da carreira, ocupa todas as funções de chefia da auditoria fiscal do trabalho no estado.",
    provisorio: true,
  },
  {
    ano: "2026",
    titulo: "Da fiscalização para o Congresso",
    texto:
      "Participa de audiência pública na Câmara sobre o combate ao trabalho escravo contemporâneo. Agora, pré-candidato a deputado federal.",
  },
];
