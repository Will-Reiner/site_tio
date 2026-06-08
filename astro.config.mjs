// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// IMPORTANTE: troque pelo domínio final da campanha quando for definido.
// Isso é usado pelo sitemap e pelas tags Open Graph (preview ao compartilhar).
const SITE = "https://eduardoreiner.com.br";

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Saída estática (padrão). Gera a pasta dist/ com HTML/CSS/JS puro,
  // pronta para subir no public_html do Hostinger (plano mais barato).
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
