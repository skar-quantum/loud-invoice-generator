# LOUD Invoice Generator

Gerador de invoices de reembolso com análise automática de recibos via IA.

## Features

- Upload de múltiplos recibos (JPG, PNG)
- Análise automática via Claude AI (extrai valor e descrição)
- Suporte a múltiplas moedas (BRL, USD, EUR, etc.)
- Geração de PDF profissional com recibos anexos
- Bill To fixo (LOUD TEAM LLC)

## Setup

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` com sua API key da Anthropic:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Execute em desenvolvimento:
   ```bash
   npm run dev
   ```

## Deploy no Vercel

1. Conecte o repositório ao Vercel
2. Adicione a variável de ambiente `ANTHROPIC_API_KEY` nas settings do projeto
3. Deploy!

## Tech Stack

- Next.js 15
- TypeScript
- Anthropic Claude API (Claude Sonnet 4)
