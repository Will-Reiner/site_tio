# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static pre-campaign website for **Eduardo Reiner** (labor inspector / "auditor fiscal do trabalho", pre-candidate for Brazilian federal deputy). Built with **Astro 5** + **Tailwind CSS v4**, output is fully static (`output: "static"`), deployed to **Cloudflare Workers** (static assets) via `npm run deploy`. The single exception to "fully static" is `worker/index.ts`, which handles `POST /api/lead` (the forms → Brevo integration). See the **Deploy & hosting** and **Forms → Brevo** sections below.

Most content is **provisional draft copy** awaiting final material from the client — marked throughout with `TODO` comments. A core design requirement is that the site must **not look AI-generated** (`README.md` and design tokens reference this explicitly); prefer hand-crafted, opinionated visuals over generic template patterns.

## Commands

```bash
npm install          # first time only
npm run dev          # dev server at http://localhost:4321 (hot reload)
npm run build        # generates dist/ (the static site to deploy)
npm run preview      # serves the built dist/ locally to verify before deploy
npm run deploy       # astro build + wrangler deploy → publishes to Cloudflare Workers
npm run cf:preview   # astro build + wrangler dev → preview the Workers runtime locally

# One-off, not part of the build: creates the missing Brevo contact attributes
# and prints the list IDs. Needs BREVO_API_KEY in the environment.
node scripts/brevo-setup.mjs
```

There is no test suite or linter configured. `npm run build` is the verification step — it type-checks content collections and catches broken references.

`npm run dev` does **not** run the Worker, so `POST /api/lead` 404s there and the forms fall back to `localStorage` on purpose. To exercise the Brevo path locally use `npm run cf:preview` (serves the built site *and* the Worker at `http://localhost:8787`, loading `.dev.vars`).

## Deploy & hosting

Hosted on **Cloudflare Workers** as a static-assets site (no Astro adapter, no SSR: the pages are all prebuilt into `dist/`). DNS is managed by Cloudflare; the domains are registered at **GoDaddy** with only their nameservers pointed to Cloudflare.

- **Deploy:** `npm run deploy` (= `astro build && wrangler deploy`). Full rebuild + upload; the weekly-edit workflow needs only this one command. Wrangler uploads just the changed files and the new version is live within seconds.
- **Worker name:** `eduardo-reiner`. Direct URL for testing: `https://eduardo-reiner.williamfilardo.workers.dev` (can be disabled once only the custom domain is used).
- **Config:** `wrangler.jsonc` at the repo root — `assets.directory: "./dist"`, `not_found_handling: "404-page"` (serves `dist/404.html`), `main: "./worker/index.ts"` and `run_worker_first: ["/api/*"]`. That last key is what keeps the site static: the Worker only executes on `/api/*`, everything else is served straight from `dist/`. No `nodejs_compat` — the Worker uses standard Web APIs only, and Wrangler compiles its TypeScript with no build step.
- **Auth:** one-time `wrangler login`. Current Cloudflare account: `williamfilardo@gmail.com`.
- **Secrets:** `BREVO_API_KEY` and `TURNSTILE_SECRET_KEY`, both used only by the Worker. Set with `wrangler secret put NAME` (production) plus a line in `.dev.vars` (local, git-ignored; see `.dev.vars.example`). Non-secret config (Brevo list IDs) goes in `vars` in `wrangler.jsonc`; the public Turnstile **site key** lives in `src/data/site.ts` because it ships in the HTML.

### Domains & redirects

Canonical domain is the **apex** `eduardoreiner.com.br` (the site's own canonical/OG tags already point there — see `SITE` in `astro.config.mjs`).

| Hostname | Behavior |
|---|---|
| `eduardoreiner.com.br` (apex) | Served by the Worker (Cloudflare **Custom Domain**), automatic SSL. |
| `www.eduardoreiner.com.br` | **301** → apex, via a Cloudflare **Redirect Rule** + a proxied placeholder record (`AAAA 100::`). |
| `eduardoreiner.com` and `www.eduardoreiner.com` | **301** → `eduardoreiner.com.br`. Separate Cloudflare zone, same redirect pattern. |

Redirect setup lives in the Cloudflare dashboard (DNS records + Redirect Rules), not in the repo. Redirect Rules are per-zone, so the `.com` rules are created in the `.com` zone.

## Forms → Brevo

All three forms (Guia `/manual/`, Eventos convite modal, Presença `/presenca/`) share one path. Change the path, not the individual pages.

```
<form> + <Turnstile />  →  src/scripts/forms.ts  →  POST /api/lead  →  worker/index.ts  →  Brevo /v3/contacts
```

- **`src/scripts/forms.ts`** — the single client-side integration point. `ligarFormulario({ form, origem, aoConcluir })` validates, records LGPD consent (`VERSAO_CONSENTIMENTO` — bump it whenever the consent copy changes), and POSTs to `/api/lead`. **A CRM failure never blocks the visitor:** the lead falls back to `localStorage` under `er_leads_pendentes`, the error goes to the console, and `aoConcluir` runs anyway.
- **`worker/index.ts`** — honeypot check → Turnstile `siteverify` → validation → field mapping → `POST /v3/contacts` with `updateEnabled: true`. Two rules encoded there on purpose: never send `emailBlacklisted` (someone who unsubscribed must not be resurrected), and always send `updateEnabled` (otherwise a repeat contact returns `duplicate_parameter`).
- **`src/components/Turnstile.astro`** — drop inside any `<form>`; it supplies the honeypot field, the Turnstile widget and the "confirm you're not a robot" notice. In the Eventos modal the form starts inside a closed `<dialog>`, so `resetarTurnstile(form)` is called on open to guarantee a fresh, valid token.
- **Missing-token handling** (`forms.ts`, three-way and deliberate): on submit, wait up to 4s for the token; if it still has not arrived and the widget is **visible** (Cloudflare wants a click), show the notice and do not submit; if the widget has **zero height** (Turnstile blocked by an extension or a corporate network), submit anyway. Never submit an empty token silently — that path dropped leads with no trace, which is what the Worker-side logging now also catches.
- **Phone numbers are identifiers in Brevo, not plain data.** `WHATSAPP` and `SMS` behave like the email: only one contact may hold a given number. Creating a *new* contact with a number that already belongs to someone else fails — as `400 duplicate_parameter` when `SMS` is in the payload, and as a thoroughly misleading `404 document_not_found "Contact does not exist"` when only `WHATSAPP` is. This is common in the wild (couples sharing a phone, one person signing up with a work and a personal email), so `tratarLead()` detects it via `conflitoDeTelefone()` and retries once without the phone fields: the lead is kept, the number is dropped, and a warning names the masked email so the duplicate can be reconciled by hand. Both fields get the same number — `WHATSAPP` is what the form asks for, `SMS` is what the Brevo UI shows in its phone column and what campaigns use.
- **Other Brevo quirks:** a `listIds` entry that does not exist is accepted with `201` and silently drops the contact from every list, so a typo in `BREVO_LISTA_*` fails invisibly. `updateEnabled: false` on an existing email returns `duplicate_parameter`. `SMS` is validated as a real phone number and rejects anything not in `+55…` form, which is why `normalizarWhatsapp()` returns `""` rather than a partial number.
- **Brevo attribute names are load-bearing.** A contact attribute that does not exist in the account is dropped silently or rejected with `invalid_parameter`. `scripts/brevo-setup.mjs` creates them (idempotent) and prints the list IDs for `wrangler.jsonc`. If you add a field to a form, add it to that script **and** to `montarAtributos()` in the Worker.
- One Brevo list per form, wired by `BREVO_LISTA_GUIA` / `_EVENTOS` / `_PRESENCA` (ids 3/4/5).
- **The production Turnstile widget only accepts `eduardoreiner.com.br`.** On localhost it fails with error `110200`, issues no token, and the Worker answers `{"erro":"turnstile"}` — expected, not a bug. Do not add localhost to the widget's domains; anyone could then mint valid tokens for the site key. To test forms locally, use Cloudflare's test keys: `PUBLIC_TURNSTILE_SITEKEY=1x00000000000000000000AA` in a `.env` (git-ignored) plus the matching test secret in `.dev.vars`. **Delete the `.env` before deploying** — `astro build` reads it, so the test key would ship. A build using a `1x…` key prints a loud warning (`src/data/site.ts`).

## Architecture

### Content vs. configuration split

Two distinct sources of editable content — know which one a change belongs to:

- **`src/data/*.ts`** — TypeScript config and short copy edited in code:
  - `site.ts` — site identity, nav, **CTA links** (WhatsApp/donation `href`s, currently `"#"`), social links (`REDES`), YouTube channels, and `TURNSTILE_SITEKEY`. This is the central "links and facts" file.
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
- The final domain is **`eduardoreiner.com.br`**, set in **three places**: `astro.config.mjs` (`SITE`), `src/data/site.ts` (`url`), and `public/robots.txt`. If it ever changes, update all three.
- Pre-campaign legal nuance: the donation CTA label/behavior should be reviewed (the code favors "Quero apoiar" over "Doar" before official candidacy) — don't silently change this framing.

## Notes

- Repo is under git on branch `main`, remote `origin` = `https://github.com/Will-Reiner/site_tio.git`. No CI configured — deploys are run manually with `npm run deploy`.
