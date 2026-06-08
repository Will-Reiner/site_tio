# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static pre-campaign website for **Eduardo Reiner** (labor inspector / "auditor fiscal do trabalho", pre-candidate for Brazilian federal deputy). Built with **Astro 5** + **Tailwind CSS v4**, output is fully static (`output: "static"`), deployed by uploading the built `dist/` folder to Hostinger's cheapest plan.

Most content is **provisional draft copy** awaiting final material from the client — marked throughout with `TODO` comments. A core design requirement is that the site must **not look AI-generated** (`README.md` and design tokens reference this explicitly); prefer hand-crafted, opinionated visuals over generic template patterns.

## Commands

```bash
npm install          # first time only
npm run dev          # dev server at http://localhost:4321 (hot reload)
npm run build        # generates dist/ (the static site to deploy)
npm run preview      # serves the built dist/ locally to verify before deploy
```

There is no test suite or linter configured. `npm run build` is the verification step — it type-checks content collections and catches broken references.

## Architecture

### Content vs. configuration split

Two distinct sources of editable content — know which one a change belongs to:

- **`src/data/*.ts`** — TypeScript config and short copy edited in code:
  - `site.ts` — site identity, nav, **CTA links** (WhatsApp/donation `href`s, currently `"#"`), social links (`REDES`), YouTube channels. This is the central "links and facts" file.
  - `conteudo.ts` — home page texts (hero, stats, pull quote, "about" paragraphs, marquee phrases).
  - `imprensa.ts`, `videos.ts` — press appearances and featured YouTube videos.
- **`src/content/`** — Astro content collections (Markdown), schemas in `src/content.config.ts`:
  - `propostas/` — one `.md` per proposal axis (`titulo`, `resumo`, `ordem`, `cor`, optional `imagem`). Sorted by `ordem`.
  - `blog/` — one `.md` per article (`titulo`, `resumo`, `data`, `autor`, `rascunho`). Pages filter out `rascunho: true`.

Pages read collections via `getCollection()` + `render()` (see `pages/propostas/index.astro` and `pages/na-midia/[slug].astro` for the canonical patterns).

### Layout & SEO

`src/layouts/Base.astro` wraps every page: it renders `Header`/`Footer`, builds title/canonical/Open Graph meta from `SITE` (in `site.ts`), and shows a **"Rascunho" draft badge only in dev** (gated on `import.meta.env.DEV`) that disappears in production builds. Pass `title`, `description`, `image`, `noindex` as props.

### Design system (Tailwind v4)

Design tokens live in `src/styles/global.css` under `@theme` — **use these, don't hardcode**:
- Colors: `rosa` (brand, `#d4135f`, tuned for AA contrast), `rosa-claro/escuro`, `tinta` (near-black), `creme` (background), `azul`, `ambar`. Use as Tailwind utilities: `bg-rosa`, `text-creme`, `border-tinta`, etc.
- Fonts: `font-display` (Archivo — headings), `font-sans` (Hanken Grotesk — body), `font-assinatura` (Caveat — handwritten accent). Self-hosted via Fontsource, imported in `Base.astro`.
- Shadows: `shadow-zine`, `shadow-zine-rosa`, `shadow-zine-azul`, `shadow-suave` (the offset "zine/poster" look).
- Custom utility classes (also in `global.css`): `.conteudo-md` (styles rendered Markdown — apply to the wrapper around `<Content />`), `.textura-grao`, `.halftone`, `.pontos`, `.marca-texto`, `.sublinhado-rosa`, `.faixa-marquee`, `.btn-press`, `.num-tabular`.

### Components

Reusable pieces in `src/components/` (`Botao`, `Header`, `Footer`, `Hero`, `PropostaCard`, `MidiaCard`, `FaixaCta`, etc.).
- **`Botao.astro`** is the canonical button — use it instead of raw `<a>`/`<button>`. Props: `variante` (`rosa`/`tinta`/`creme`/`contorno`/`azul`/`whatsapp`), `tamanho` (`sm`/`md`/`lg`), `icone`/`iconeFim`, `href` (renders `<a>` when set, else `<button>`).
- **`Icon.astro`** is a self-contained inline-SVG icon set (no icon library, no emoji). Brand icons are `fill`; UI icons are stroke. **To add an icon, add an entry to the `icons` map in `Icon.astro`** rather than importing a dependency.

## Conventions

- **Everything is in Portuguese (pt-BR)** — content, prop names, component names, variable names, comments. `<html lang="pt-BR">`. Match this when adding code.
- Images go in `src/assets/` and are referenced through Astro's `<Image>` / content-collection `image()` for automatic optimization. `public/` is only for raw passthrough files (`favicon.svg`, `robots.txt`, `og.jpg`).
- When the **final domain** is set, update it in **three places**: `astro.config.mjs` (`SITE`), `src/data/site.ts` (`url`), and `public/robots.txt`.
- Pre-campaign legal nuance: the donation CTA label/behavior should be reviewed (the code favors "Quero apoiar" over "Doar" before official candidacy) — don't silently change this framing.

## Notes

- `prompt2.md` is a running list of client-requested changes (in Portuguese) — useful context for current work in progress.
- Repo is **not** under git yet; there's no remote/CI configured.
