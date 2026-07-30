// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Domínio final da campanha (confirmado).
// Usado pelo sitemap e pelas tags Open Graph (preview ao compartilhar).
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
