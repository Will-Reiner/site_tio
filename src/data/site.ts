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
    "Eduardo Reiner, auditor fiscal do trabalho, é pré-candidato a deputado federal. Conheça a história, as propostas e faça parte.",
};

// --- Navegação principal ---
export const NAV = [
  { href: "/", label: "Início" },
  { href: "/minha-historia/", label: "Minha História" },
  { href: "/propostas/", label: "Propostas" },
  { href: "/na-midia/", label: "Na Mídia" },
] as const;

// --- Botões de ação (CTAs) ---
// Links de teste enquanto o cliente não envia os finais.
export const CTA = {
  whatsapp: {
    // Comunidade no WhatsApp (provisório — número 61 99837-8070).
    href: "https://wa.me/5561998378070",
    label: "Entrar na comunidade",
    labelCurto: "Comunidade",
  },
  doar: {
    // Apoio via Vakinha (provisório — apontando para o site da Vakinha
    // só para teste; trocar pela URL da campanha quando houver).
    href: "https://www.vakinha.com.br/",
    // Obs. pré-campanha: confirmar rótulo e conformidade com a assessoria
    // jurídica — "Quero apoiar" tende a ser mais seguro antes do registro
    // oficial de candidatura do que "Doar".
    label: "Quero apoiar",
    labelCurto: "Apoiar",
  },
};

// --- Redes sociais (somente as fornecidas pelo cliente) ---
export const REDES = [
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
// TODO: o cliente tem Instagram? É a principal rede em campanha no Brasil.
// Se sim, adicionar aqui com rede: "instagram".

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
