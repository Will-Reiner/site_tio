# Site de pré-campanha — Eduardo Reiner

Site institucional da pré-campanha de **Eduardo Reiner** (auditor fiscal do
trabalho, pré-candidato a deputado federal). Feito em **Astro + Tailwind CSS**,
gera um site **estático** rápido — pronto para hospedar no plano mais barato do
Hostinger.

> ⚠️ **Conteúdo provisório.** Os textos, números e algumas imagens são de
> rascunho, só para dar forma ao site. Tudo está marcado e é fácil de trocar
> (veja **“Como editar o conteúdo”** abaixo). Em modo de desenvolvimento aparece
> um selo “Rascunho” no canto — ele some automaticamente no site publicado.

---

## 1. Pré-requisitos

- **Node.js 18+** (recomendado 20 ou 22). Baixe em https://nodejs.org → versão LTS.
- Um editor de código (ex.: VS Code ou Cursor).

## 2. Rodar no seu computador

Abra o terminal **na pasta do projeto** e rode:

```bash
npm install      # só na primeira vez (baixa as dependências)
npm run dev      # inicia o site em http://localhost:4321
```

Abra `http://localhost:4321` no navegador. Ao salvar um arquivo, a página
atualiza sozinha.

## 3. Estrutura — onde fica cada coisa

```
src/
  data/
    site.ts        → LINKS e dados gerais (WhatsApp, Doar, redes sociais, nav)
    conteudo.ts    → TEXTOS da home (frase do herói, números, citação, etc.)
    imprensa.ts    → lista de aparições na imprensa
    videos.ts      → vídeos em destaque do YouTube (por ID)
  content/
    propostas/     → 1 arquivo .md por eixo de proposta
    blog/          → 1 arquivo .md por artigo
  assets/          → fotos do Eduardo (otimizadas automaticamente)
  components/      → peças visuais reutilizáveis (botões, cards, herói...)
  pages/           → as páginas do site (Início, História, Propostas, Mídia)
  styles/global.css→ CORES e tipografia (tokens de design)
public/            → favicon, robots.txt e a imagem de compartilhamento (og.jpg)
```

## 4. Como editar o conteúdo

**Links de WhatsApp e Doação** → `src/data/site.ts`, no bloco `CTA`. Troque os
`"#"` pelos links reais.

**Redes sociais** → `src/data/site.ts`, no bloco `REDES` (já estão preenchidas;
falta só o Instagram, se houver).

**Textos da home** (frase principal, números, citação) → `src/data/conteudo.ts`.

**Propostas** → pasta `src/content/propostas/`. Cada arquivo `.md` é um eixo.
Edite o título, o resumo e os tópicos. Para adicionar uma imagem de fundo,
coloque o arquivo junto do `.md` e adicione `imagem: ./nome-da-imagem.jpg` no
topo do arquivo.

**Artigos do blog** → pasta `src/content/blog/`. Copie um arquivo existente,
renomeie e edite. Para esconder um rascunho, coloque `rascunho: true` no topo.

**Imprensa** → `src/data/imprensa.ts`. **Vídeos** → `src/data/videos.ts`
(há instruções dentro de cada arquivo).

**Fotos** → coloque em `src/assets/` e use nos componentes. As fotos atuais são:
`eduardo-cracha.jpeg`, `eduardo-entrevista.jpeg`, `eduardo-arte-popart.jpeg`.

**Cores** → `src/styles/global.css`, no bloco `@theme` (rosa, tinta, creme...).

**Domínio** → quando definir o domínio final, troque em `astro.config.mjs`
(`SITE`), em `src/data/site.ts` (`url`) e em `public/robots.txt`.

## 5. Publicar (build) e subir no Hostinger

O Astro gera um site **estático** — você cria os arquivos no seu PC e sobe a
pasta pronta. Nenhuma configuração especial é necessária.

### Passo a passo

1. No terminal, dentro da pasta do projeto:
   ```bash
   npm run build
   ```
   Isso cria a pasta **`dist/`** com o site pronto (HTML/CSS/JS).

2. Entre no **hPanel** do Hostinger → **Arquivos → Gerenciador de Arquivos**.

3. Abra a pasta **`public_html`** e **suba o conteúdo de dentro de `dist/`**
   (todos os arquivos e pastas que estão DENTRO de `dist`, não a pasta `dist`
   em si). Pode arrastar e soltar, ou enviar um `.zip` e extrair ali.

   *Alternativa por FTP:* hPanel → **Arquivos → Contas FTP**, conecte com um
   programa como o **FileZilla** e envie o conteúdo de `dist/` para `public_html`.

4. Aponte o **domínio** para a hospedagem e ative o **SSL grátis** no hPanel.

5. Acesse o domínio para conferir. Pronto! 🎉

> A cada atualização do site, repita os passos 1 e 3 (rodar `npm run build` e
> subir o novo conteúdo de `dist/`).

### (Opcional) Deploy automático

Quando o projeto estiver no GitHub, dá para configurar uma **GitHub Action** que
roda o `build` e envia por FTP a cada alteração — assim você não precisa subir à
mão. Posso configurar isso quando quiser.

## 6. Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | site em desenvolvimento (atualiza ao salvar) |
| `npm run build` | gera a pasta `dist/` para publicar |
| `npm run preview` | testa localmente o site já “buildado” |

## 7. Pendências (quando o material chegar)

- [ ] Links reais de **Comunidade no WhatsApp** e **Doação/Apoio** (`site.ts`).
- [ ] **Textos finais** (home, história, propostas, blog).
- [ ] **Imagens de fundo** das propostas.
- [ ] **Números** reais no bloco de estatísticas (`conteudo.ts`).
- [ ] **Instagram** (se houver) em `REDES`.
- [ ] Imagem de compartilhamento `public/og.jpg` (ideal: 1200×630).
- [ ] Conferir com a assessoria jurídica o rótulo/forma do botão de doação na
      fase de **pré-campanha**.
- [ ] Definir o **domínio** e atualizá-lo nos 3 lugares citados.
