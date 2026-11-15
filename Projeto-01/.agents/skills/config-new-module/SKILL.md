---
name: config-new-module
description: Cria de forma determinística um novo módulo de negócio em um monorepo Turborepo (criado pela skill config-project-fullstack) — pacote em modules/<nome> com Jest, módulo + controller NestJS em apps/backend/src/modules/<nome> registrado no AppModule, e rota + página + componente Next.js no frontend — e depois instala, faz build e roda os testes do módulo. Use sempre que o usuário pedir para criar/configurar um novo módulo (ex.: auth, reports, transactions), mencionar "Configurar Novo Modulo" ou config-new-module, mesmo sem citar o nome da skill.
---

# config-new-module

Skill **determinística**: todo o trabalho é feito por `scripts/new-module.mjs`,
usando os arquivos literais da pasta `assets/`. Não crie os arquivos à mão, não
improvise e não altere nada fora do que o script faz.

## Antes de executar

1. **Namespace é obrigatório.** Se o usuário não informou um namespace, **não
   execute** — pergunte qual é.
   - Se ele disser "usando o namespace do projeto", leia o campo `name` de
     `apps/backend/package.json` (ex.: `@meu-projeto/backend` → `@meu-projeto`)
     e use esse valor. Se o nome não tiver escopo (`@...`), pare e pergunte.
2. **Nome do módulo**: em kebab-case minúsculo (`auth`, `reports`, `transactions`, `user-profile`).
3. **Tipo de rota no frontend**:
   - padrão: **privada** → `src/app/(private)/<nome>/page.tsx`
   - se o usuário pedir rota pública (ex.: módulo de autenticação, "rotas públicas",
     "app/(public)") → use `--route public` → `src/app/(public)/<nome>/page.tsx`

## Como executar

Sempre a partir da raiz do projeto:

```bash
node .agents/skills/config-new-module/scripts/new-module.mjs --name transactions --namespace @meu-projeto
```

Rota pública:

```bash
node .agents/skills/config-new-module/scripts/new-module.mjs --name auth --namespace @meu-projeto --route public
```

A execução inclui `npm install`, `npm run build` e testes — pode levar alguns
minutos. Rode em background se a ferramenta tiver limite de tempo e espere terminar.

## O que o script faz (ordem fixa)

0. Verificações: namespace informado e válido, coerente com o namespace do
   projeto; nome válido; estrutura do projeto presente; o módulo **não pode já
   existir** em nenhum dos destinos (nunca sobrescreve).
1. Cria `modules/` (se não existir) e `modules/<nome>/` com os assets:
   `package.json` (nome `@namespace/<nome>`), `tsconfig.json`, `jest.config.ts`,
   `src/index.ts`, `src/index.test.ts`.
   Se `packages/shared` existir (skill `config-shared-module`), o módulo também
   recebe `"@namespace/shared": "*"` — todo módulo de negócio depende do shared.
2. Adiciona `"@namespace/<nome>": "*"` em `dependencies` de `apps/frontend` e `apps/backend`.
3. Garante `ts-node` `^10.9.2` em `devDependencies` da raiz e
   `workspaces` contendo `apps/*`, `modules/*`, `packages/*`.
4. Backend NestJS: cria `<nome>.module.ts` e `<nome>.controller.ts` (mesma estrutura de
   `nest g module` + `nest g controller --no-spec`, a partir dos assets) e registra o módulo
   nos `imports` do `AppModule`. `GET /<nome>` retorna `{ module, message }`. Sem testes no backend.
   Os imports seguem o estilo do backend (com `.js` no NestJS ≥ 12/ESM).
5. Frontend Next.js:
   - rota: `apps/frontend/src/app/(private|public)/<nome>/page.tsx`
   - página principal: `apps/frontend/src/modules/<nome>/<nome>.page.tsx`
   - componente principal: `apps/frontend/src/modules/<nome>/<nome>.component.tsx`
     (busca `GET ${NEXT_PUBLIC_API_URL}/<nome>` e mostra a mensagem)
6. `npm install` → `npm run build` → `npm test` no módulo criado.

Se algum passo falhar o script para com `[ERRO]` e código ≠ 0. Reporte o erro
exatamente como apareceu; não tente concluir os passos manualmente.

## Ao terminar

Informe os caminhos criados, o endpoint (`GET http://localhost:4000/<nome>`),
a rota do frontend (`http://localhost:3000/<nome>`) e o resultado do build e dos testes.
