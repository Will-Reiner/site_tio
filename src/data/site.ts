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
  // Domínio final da campanha (confirmado):
  url: "https://eduardoreiner.com.br",
  // Descrição usada no SEO e no preview ao compartilhar (Open Graph / WhatsApp):
  descricao:
    "Eduardo Reiner, auditor fiscal do trabalho, é pré-candidato a deputado federal. Conheça a história, as lutas e faça parte.",
};

// --- Turnstile (proteção anti-robô dos formulários) ---
// A "site key" é PÚBLICA de propósito: ela aparece no HTML da página.
// O par dela, a "secret key", é secret do Worker e NUNCA entra no git:
//   npx wrangler secret put TURNSTILE_SECRET_KEY
// Widget do domínio eduardoreiner.com.br, modo "Managed" (criado em
// 2026-08-07). Ele SÓ funciona nesse domínio: em localhost a Cloudflare
// devolve o erro 110200 e nenhum token é gerado. Isso é proposital, e não
// vale adicionar localhost aos domínios do widget (qualquer um poderia
// gerar token válido para a sua site key rodando um site na própria
// máquina). Para testar formulário local, use as chaves de TESTE via .env
// e .dev.vars — ver .dev.vars.example.
export const TURNSTILE_SITEKEY =
  import.meta.env.PUBLIC_TURNSTILE_SITEKEY || "0x4AAAAAAEJqgV7ac51td-7X";

// Rede de segurança: as chaves de teste da Cloudflare começam com "1x" e
// aprovam qualquer robô. Se um build sair com ela (porque o .env de teste
// ficou na pasta), o aviso aparece no terminal do "npm run build" e do
// "npm run deploy".
if (TURNSTILE_SITEKEY.startsWith("1x")) {
  console.warn(
    "\n  ATENÇÃO: este build está usando a SITE KEY DE TESTE do Turnstile,\n" +
      "  que aprova qualquer robô. Veio do arquivo .env na raiz do projeto.\n" +
      "  NÃO faça deploy assim: apague o .env e rode o build de novo.\n",
  );
}

// --- Navegação principal ---
export const NAV = [
  { href: "/", label: "Início" },
  { href: "/minha-historia/", label: "Minha História" },
  { href: "/manual/", label: "Guia Trabalhista" },
  { href: "/eventos/", label: "Eventos" },
  { href: "/na-midia/", label: "Na Mídia" },
] as const;

// --- Botões de ação (CTAs) ---
export const CTA = {
  whatsapp: {
    // Canal (comunidade) oficial no WhatsApp — todos os botões de WhatsApp do
    // site apontam para cá. Atenção: canal é transmissão, o público não
    // responde por ele; para conversa direta use `CTA.instagram` (DM).
    href: "https://whatsapp.com/channel/0029VbCwoCO1XquROusetM31",
    label: "Entrar na comunidade",
    labelCurto: "Comunidade",
  },
  instagram: {
    // Link de conversa direta (DM) no Instagram — usado no botão
    // "Não encontrei minha dúvida" do Guia e onde for preciso falar direto.
    href: "https://ig.me/m/eduardo.reiner",
    label: "Falar no Instagram",
    labelCurto: "Instagram",
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
