# Recomendações de infraestrutura — site Eduardo Reiner

Documento de apoio à decisão sobre **hospedagem** e **e-mail/CRM**, conforme pedido no
`prompt.md`. Escrito para uma pré-campanha (eventos de ~200 pessoas) que pode virar campanha
(eventos de até ~1000 pessoas).

---

## 1. Hospedagem

### Ponto principal (importante entender)

**200 a 1000 pessoas _num evento_ não é tráfego web alto.** Mesmo que todas escaneassem o QR Code
e abrissem o site ao mesmo tempo, seriam ~1000 acessos em poucos minutos — trivial para qualquer
**site estático servido por CDN**. Este site já é estático (`output: "static"` no Astro), então a
"capacidade" não é o gargalo. O que precisa de serviço dedicado são as **partes dinâmicas**
(formulários, lista de presença, envio de e-mail) — resolvidas pela ferramenta de CRM/e-mail
(seção 2), e não pelo servidor do site.

### Recomendação: Cloudflare Pages (grátis)

| Item | Cloudflare Pages |
|---|---|
| Custo | **Grátis** (plano generoso) |
| Banda / requisições | Ilimitadas no free |
| CDN global + SSL | Sim, automático |
| Domínio próprio | Sim |
| Pico de evento | Absorve sem esforço |
| Deploy | Sobe o `dist/` (mesmo artefato de hoje) ou conecta ao Git para deploy automático |

Vantagens: desacopla totalmente da VPS que será perdida; se um dia precisar de backend leve
(ex.: receber formulário via função própria), há **Cloudflare Workers/Functions** no mesmo
ecossistema.

**Ação sugerida:** apontar o DNS do domínio para a Cloudflare e publicar via Cloudflare Pages.

### Alternativas (com trade-offs)

- **Netlify** — free 100 GB/mês + **Netlify Forms** embutido (100 envios/mês grátis, depois pago).
  Bom se quiser captação de formulário sem CRM já no começo; tem teto de banda.
- **Vercel** — excelente para Astro, mas o plano Hobby é "uso não comercial"; uma campanha
  precisaria do **Pro (~US$ 20/mês)**.
- **Manter Hostinger** (plano compartilhado barato) — serve estático sem problema. Só vale se
  quiser concentrar domínio/e-mail no mesmo lugar; para o pico, Cloudflare Pages é grátis e melhor.

---

## 2. E-mail + CRM

O Brief pede bastante: formulários alimentando uma base, **segmentação** (origem, interesse,
cidade, evento), **registro de consentimento LGPD** (data/hora/versão do texto), **automações**
de e-mail (SPF/DKIM/DMARC), eventos e certificados. Isso é trabalho de **ferramenta dedicada**,
não de código no site.

### Recomendação principal: Brevo (ex-Sendinblue)

All-in-one que cobre quase todo o Brief num só lugar:

- CRM + lista de contatos com etiquetas e segmentação;
- E-mail marketing **e** transacional (confirmações, envio de certificado);
- **Automações** (fluxos: acesso ao Manual, confirmação/lembrete de evento, pós-evento, comunidade);
- **Formulários e landing pages embutíveis** (gravam direto no CRM, com opt-in);
- WhatsApp e SMS;
- Contatos ilimitados no plano free (300 e-mails/dia); planos pagos acessíveis;
- Interface e suporte em português, LGPD-friendly.

### Alternativa (fornecedor brasileiro): RD Station Marketing + RD Station CRM

Líder no Brasil, automação + CRM robustos, LGPD-first, suporte local em português. Mais caro, mas
"feito para o mercado brasileiro" — boa escolha se preferir fornecedor nacional e topar pagar mais.

Outras opções: **Mailchimp** (conhecido, menos foco em BR/LGPD, encarece ao escalar), **HubSpot**
(CRM free forte, mas e-mail limitado no free), **ActiveCampaign** (automação/CRM avançados).

### Como isso se conecta ao site (já preparado no código)

Todos os formulários do site (Manual, Eventos, Lista de presença, Contato) passam por um **ponto
único de integração** em `src/scripts/forms.ts` (função `enviarFormulario`/`ligarFormulario`). Hoje
ele valida, **registra o consentimento LGPD** (origem, data/hora e versão do texto) e guarda o lead
localmente para não se perder. Quando escolher a ferramenta, há **dois caminhos**:

1. **Formulário nativo embutido** do Brevo/RD (mais simples): troca-se o `<form>` da página pelo
   embed da ferramenta — o envio já cai no CRM com opt-in.
2. **API via função serverless** (mais controle): mantém-se o formulário atual e liga-se o
   `enviarParaCRM()` à API do Brevo/RD (ex.: Cloudflare Worker).

### Boas práticas de envio (reduzir spam) — do próprio Brief

- Autenticar o domínio com **SPF, DKIM e DMARC** antes dos disparos.
- Remetente institucional e reconhecível, com domínio próprio.
- Enviar só para quem autorizou; **link de descadastro** em todo e-mail recorrente.
- Segmentar por interesse/cidade/evento/origem.
- Evitar caixa alta, excesso de emojis/links e anexos pesados (preferir botões/links).
- **Aquecimento gradual** da lista, principalmente com domínio novo.
- Remover inválidos, descadastrados e bounces da base ativa.

---

## 3. Resumo executivo

| Necessidade | Recomendação | Custo aproximado |
|---|---|---|
| Hospedagem do site | **Cloudflare Pages** | Grátis |
| CRM + e-mail + formulários + automação | **Brevo** (ou **RD Station**, se quiser fornecedor BR) | Free para começar; pago conforme volume |
| Domínio + autenticação de e-mail | SPF/DKIM/DMARC no provedor de DNS (Cloudflare) | Incluso |

> Observação: a escolha do CRM/e-mail e a autenticação do domínio são ações do cliente. O **código
> do site já deixa os pontos de integração prontos** — nenhuma mudança de UI é necessária para
> ligar a ferramenta depois.
