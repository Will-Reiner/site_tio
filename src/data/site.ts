// =====================================================================
// Configuração central do site — Eduardo Reiner (pré-campanha)
// Edite AQUI os links e dados que mudam. Textos longos de cada página
// ficam nas próprias páginas e nas coleções de conteúdo (src/content),
// sempre marcados como provisórios quando for o caso.
// =====================================================================

export const SITE = {
  nome: "Eduardo Reiner",
  primeiroNome: "Eduardo",
  cargo: "Pré-candidato a Deputado Federal",
  profissao: "Auditor Fiscal do Trabalho",
  // TROCAR pelo domínio final da campanha:
  url: "https://eduardoreiner.com.br",
  // Descrição usada no SEO e no preview ao compartilhar (Open Graph / WhatsApp):
  descricao:
    "Eduardo Reiner, auditor fiscal do trabalho, é pré-candidato a deputado federal. Conheça a história, as lutas e faça parte.",
};

// --- Navegação principal ---
export const NAV = [
  { href: "/", label: "Início" },
  { href: "/minha-historia/", label: "Minha História" },
  { href: "/manual/", label: "Manual Trabalhista" },
  { href: "/eventos/", label: "Eventos" },
  { href: "/na-midia/", label: "Na Mídia" },
] as const;

// --- Botões de ação (CTAs) ---
export const CTA = {
  whatsapp: {
    // WhatsApp de contato direto — número oficial +55 41 8492-1322.
    // (Quando o cliente enviar o link da COMUNIDADE — convite chat.whatsapp.com —
    // criar um CTA separado; por ora este é o canal de conversa direta.)
    href: "https://wa.me/554184921322",
    label: "Falar no WhatsApp",
    labelCurto: "WhatsApp",
  },
  doar: {
    // Apoio via vakinha oficial da campanha.
    href: "https://queroapoiar.com.br/eduardoreiner",
    // Obs. pré-campanha: confirmar rótulo e conformidade com a assessoria
    // jurídica — "Quero apoiar" tende a ser mais seguro antes do registro
    // oficial de candidatura do que "Doar".
    label: "Quero apoiar",
    labelCurto: "Apoiar",
  },
};

// --- Redes sociais (somente as fornecidas pelo cliente) ---
// Instagram em primeiro (principal rede em campanha no Brasil).
export const REDES = [
  {
    rede: "instagram" as const,
    nome: "Instagram",
    handle: "@eduardo.reiner",
    href: "https://instagram.com/eduardo.reiner",
  },
  {
    rede: "youtube" as const,
    nome: "Canal do Eduardo",
    handle: "@eduardo.reiner",
    href: "https://youtube.com/@eduardo.reiner",
  },
  {
    rede: "youtube" as const,
    nome: "Imersão AFT",
    handle: "@imersaoaft",
    href: "https://youtube.com/@imersaoaft",
  },
  {
    rede: "x" as const,
    nome: "X (Twitter)",
    handle: "@eduardoreiner",
    href: "https://x.com/eduardoreiner",
  },
  {
    rede: "facebook" as const,
    nome: "Facebook",
    handle: "Eduardo Reiner",
    href: "https://www.facebook.com/share/1LCQ8PYCN5/",
  },
  {
    rede: "tiktok" as const,
    nome: "TikTok",
    handle: "@eduardoreiner72",
    href: "https://www.tiktok.com/@eduardoreiner72",
  },
];
// TODO: incluir o LinkedIn quando o cliente enviar a URL (e adicionar o
// ícone "linkedin" no mapa de ícones em Icon.astro).

// --- Canais de YouTube em destaque (usado na página Na Mídia) ---
export const CANAIS_YOUTUBE = [
  {
    nome: "Eduardo Reiner",
    descricao: "Bastidores, posicionamentos e a caminhada da pré-campanha.",
    handle: "@eduardo.reiner",
    href: "https://youtube.com/@eduardo.reiner",
  },
  {
    nome: "Imersão AFT",
    descricao:
      "Conteúdo sobre auditoria fiscal do trabalho e preparação para o concurso.",
    handle: "@imersaoaft",
    href: "https://youtube.com/@imersaoaft",
  },
];
