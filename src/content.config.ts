import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Eixos de proposta — cada arquivo .md em src/content/propostas/ vira um eixo.
// O cliente pode editar o texto e (depois) apontar a imagem de fundo.
const propostas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/propostas" }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      resumo: z.string(),
      ordem: z.number().default(99),
      cor: z.enum(["rosa", "azul", "ambar", "tinta"]).default("rosa"),
      // Imagem de fundo do eixo (opcional). Coloque o arquivo junto do .md
      // e referencie como: imagem: ./minha-imagem.jpg
      imagem: image().optional(),
    }),
});

// Blog / artigos — cada arquivo .md em src/content/blog/ vira um post.
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      titulo: z.string(),
      resumo: z.string(),
      data: z.coerce.date(),
      autor: z.string().default("Eduardo Reiner"),
      imagem: image().optional(),
      rascunho: z.boolean().default(false),
    }),
});

export const collections = { propostas, blog };
