---
name: config-project-fullstack
description: Cria do zero um monorepo fullstack Turborepo (npm) com frontend Next.js (porta 3000, src/) e backend NestJS (porta 4000, CORS, @nestjs/config lendo .env), executando um script determinístico que roda e valida cada passo. Use SEMPRE que o usuário pedir para criar, configurar, inicializar ou "montar do zero" um projeto fullstack, monorepo, turbo/turborepo, Next + Nest, frontend + backend, ou mencionar "config-project-fullstack" — mesmo que não cite a skill pelo nome. Aceita nome do projeto e namespace npm opcional (ex.: @minha-empresa) para renomear todos os pacotes no final.
---

# config-project-fullstack

Esta skill monta um monorepo fullstack a partir de uma pasta vazia. Todo o trabalho
é feito pelo script `scripts/setup.mjs`, que executa os passos em ordem fixa,
valida cada um e aborta no primeiro erro. **Não reproduza os passos à mão nem
improvise alternativas**: o valor da skill é ser determinística — o mesmo comando
produz sempre a mesma estrutura, e qualquer desvio aparece como erro explícito.

## Como executar

1. Identifique os parâmetros no pedido do usuário:
   - **Nome do projeto** (pasta a ser criada). Padrão: `projeto-exemplo`.
     Deve ser minúsculo, sem espaços (regras de nome de pacote npm).
   - **Namespace** (opcional), ex.: `@acme`. Se o usuário escrever sem `@`,
     passe como veio — o script normaliza.
2. Rode, a partir da pasta onde o projeto deve ser criado (normalmente a raiz do
   repositório atual, a que contém `.agents/`):

   ```bash
   node .agents/skills/config-project-fullstack/scripts/setup.mjs --name <nome> [--namespace @escopo]
   ```

   Opções extras: `--dir <pasta-base>` (padrão: diretório atual) e
   `--skip-verify` (pula a verificação final com servidores; use só se o usuário pedir).
3. O processo leva vários minutos (instalações via npm). Rode em background se a
   ferramenta permitir e aguarde terminar; não interrompa no meio.
4. Ao final, relate ao usuário o resumo impresso pelo script (pasta criada,
   namespace aplicado, resultado das verificações). Se falhar, mostre a mensagem
   de erro do passo que falhou e **não tente "consertar" editando arquivos
   manualmente** — corrija a causa (porta ocupada, pasta já existente, rede) e
   rode o script de novo numa pasta limpa.

## O que o script faz (em ordem)

| # | Passo |
|---|-------|
| 0 | Pré-checagens: Node ≥ 20, npm, nome/namespace válidos, pasta destino inexistente, portas 3000/4000 livres |
| 1 | `npx create-turbo@latest <nome> -m npm` |
| 2 | Remove tudo em `apps/*` (com trava: só apaga dentro da pasta do projeto) |
| 3 | `npx create-next-app@latest frontend --yes --src-dir` (em `apps/`) |
| 4 | `npm i -g @nestjs/cli` (pula se `nest` já existir) |
| 5 | `nest new backend -g -p npm --no-observe` (em `apps/`) |
| 6 | `npm install @nestjs/config` (em `apps/backend`) |
| 7 | Sobrescreve `apps/backend/src/app.module.ts` com `ConfigModule.forRoot({ isGlobal: true })` |
| 8 | Sobrescreve `apps/backend/src/main.ts` (CORS + `process.env.PORT ?? 4000`) |
| 9 | Adiciona `"dev": "nest start --watch"` em `apps/backend/package.json` |
| 10 | Cria `apps/frontend/.env.example` (`NEXT_PUBLIC_API_URL=http://localhost:4000`) e copia para `.env` |
| 11 | Cria `apps/backend/.env.example` (`PORT=4000`) e copia para `.env` |
| 12 | (se `--namespace`) Renomeia `frontend`, `backend` e todos os `@repo/*` para `@escopo/*`, atualizando dependências e imports |
| 13 | `npm install` na raiz para sincronizar workspaces e lockfile |
| 14 | Verificação: build do backend; prova que o backend lê `.env` (sobe com um `.env` temporário em outra porta); `npm run dev` na raiz e confirma frontend em `:3000` e backend em `:4000` |

Desvios mínimos em relação ao passo a passo original, todos para manter a execução
não interativa: `--no-observe` no `nest new` (a CLI nova pergunta sobre observabilidade)
e `!.env.example` no `.gitignore` do frontend (o template do Next ignora `.env*`,
o que esconderia o `.env.example` do git).

## Resultado esperado

```
<nome>/
├── apps/
│   ├── frontend/   Next.js (src/), .env + .env.example, porta 3000
│   └── backend/    NestJS, @nestjs/config, CORS, .env + .env.example, porta 4000
├── packages/       ui, eslint-config, typescript-config (do create-turbo)
├── package.json    workspaces npm + turbo
└── turbo.json
```

Para rodar depois: `cd <nome> && npm run dev`.
