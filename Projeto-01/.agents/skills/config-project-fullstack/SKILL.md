---
name: config-project-fullstack
description: Cria do zero, de forma determinística e NA PASTA ATUAL, um monorepo fullstack Turborepo (npm) com frontend Next.js (porta 3000) e backend NestJS (porta 4000, CORS habilitado, lendo variáveis de ambiente via @nestjs/config), incluindo .env/.env.example e, opcionalmente, troca o namespace (@escopo) de todos os pacotes. Use sempre que o usuário pedir para configurar/criar/iniciar um novo projeto fullstack, monorepo turbo, "projeto do zero" com Next + Nest, ou mencionar "Config Projeto Fullstack"/config-project-fullstack — mesmo que não cite o nome da skill.
---

# config-project-fullstack

Esta skill é **determinística**: todo o trabalho é feito pelo script
`scripts/setup.mjs`. Não execute os passos manualmente, não improvise comandos
e não altere arquivos gerados fora do que o script faz.

## Onde o projeto é criado

**Sempre na pasta atual** — a pasta raiz que a ferramenta de IA (Claude Code,
Codex etc.) está monitorando. O script **não cria uma subpasta** para o projeto
e não cria nada em outro lugar.

- Itens que já existem na pasta e não conflitam (ex.: `.agents/`, `.git/`, `docs/`)
  ficam **intactos**, exatamente onde estão.
- Se a pasta já tiver um projeto (`package.json`, `turbo.json`, `apps/`,
  `packages/`, `package-lock.json` ou `node_modules/`), o script **para sem
  alterar nada** — ele nunca roda duas vezes sobre um projeto existente.
- Se o template do Turborepo for criar um arquivo que já existe na pasta
  (ex.: `README.md`, `.gitignore`), o script também para sem alterar nada e
  lista os conflitos.

## Como executar

Na raiz do projeto (a pasta atual):

```bash
node .agents/skills/config-project-fullstack/scripts/setup.mjs
```

Com namespace (só passe se o usuário informar, ex.: `@meu-projeto`):

```bash
node .agents/skills/config-project-fullstack/scripts/setup.mjs --namespace @meu-projeto
```

| Opção | Descrição |
|---|---|
| `--namespace <@escopo>` | Ao final, renomeia frontend, backend e todos os pacotes de `packages/*` para `@escopo/<nome>` e atualiza as referências. |
| `--skip-verify` | Pula a verificação final (subir servidores e testar portas). |

O script leva vários minutos (downloads do npm). Rode-o em background se a
ferramenta tiver limite de tempo, e espere terminar.

## O que o script faz (em ordem fixa)

0. Verificações de segurança: Node ≥ 20, npm/npx disponíveis, namespace válido,
   pasta atual sem projeto existente.
1. `npx create-turbo@latest -m npm` (gerado numa subpasta temporária, sem
   instalar, e movido para a pasta atual sem tocar nos itens existentes;
   `name` do `package.json` raiz = nome da pasta) + `npm install`
2. Remove tudo dentro de `apps/`
3. `npx create-next-app@latest frontend --yes --src-dir` (em `apps/`)
4. `npm i -g @nestjs/cli` (fallback para `npx @nestjs/cli` se `nest` não estiver no PATH)
5. `nest new backend -g -p npm` (em `apps/`)
6. `npm install @nestjs/config` (em `apps/backend`)
7. Reescreve `apps/backend/src/app.module.ts` (ConfigModule global)
8. Reescreve `apps/backend/src/main.ts` (CORS + porta 4000)
9. Adiciona `"dev": "nest start --watch"` em `apps/backend/package.json`
10. Cria `apps/frontend/.env.example` (`NEXT_PUBLIC_API_URL=http://localhost:4000`) e copia para `.env`
11. Cria `apps/backend/.env.example` (`PORT=4000`) e copia para `.env`
12. `npm install` na raiz (liga os novos workspaces)
13. *(se `--namespace`)* renomeia pacotes e referências, depois `npm install` de novo
14. Verificação:
    - backend sobe com `.env` temporário `PORT=4100` → prova que lê variáveis de ambiente (o `.env` original é restaurado)
    - `npm run dev` na raiz → frontend responde em **3000** e backend em **4000**
    - os servidores são encerrados ao final

Se qualquer passo falhar, o script para com código ≠ 0 e mensagem `[ERRO]`.
Reporte o erro exatamente como apareceu; não tente "consertar" executando
passos à mão.

## Ao terminar

Informe ao usuário o namespace aplicado (se houver), o resultado da verificação
e como rodar: `npm run dev` (frontend http://localhost:3000, backend http://localhost:4000).
