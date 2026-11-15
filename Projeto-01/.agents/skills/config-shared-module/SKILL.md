---
name: config-shared-module
description: Cria de forma determinística o módulo de infraestrutura compartilhado packages/shared (@namespace/shared) em um monorepo criado pela skill config-project-fullstack — erros de domínio (DomainError, ValidationError 422, NotFoundError 404, UnauthorizedError 401), sistema de validação com i18n (ValidationRule, Validator, ValidationException e 59 regras prontas: texto, número, data, UUID, URL, senha, CPF/CNPJ/CEP, arrays...), entidade base (Entity com UUID v4, validate, equals, clone), interface UseCase e interfaces de repositório (CRUD e paginação) — com testes e 100% de cobertura. Use sempre que o usuário pedir para criar o módulo shared/compartilhado/de infraestrutura, a base de domínio, validações reutilizáveis, entidade base, casos de uso ou repositórios genéricos do projeto.
---

# config-shared-module

Skill **determinística**: o script `scripts/create-shared.mjs` copia literalmente os
arquivos de `assets/shared/` para `packages/shared/`, troca o namespace e liga as
dependências. Não escreva esse código à mão nem o altere durante a execução.

## Antes de executar

- **Namespace é obrigatório.** Se não for informado, pergunte. Se o usuário disser
  "namespace do projeto", leia `name` de `apps/backend/package.json`
  (ex.: `@meu-projeto/backend` → `@meu-projeto`).
- Rode na **raiz do projeto**.
- Se `packages/shared` já existir, o script para sem alterar nada.

## Como executar

```bash
node .agents/skills/config-shared-module/scripts/create-shared.mjs --namespace @meu-projeto
```

Leva alguns minutos (`npm install` + build + testes). Rode em background se a
ferramenta tiver limite de tempo.

## O que o script faz (ordem fixa)

1. Cria `packages/shared` (pacote `@namespace/shared`, está em `packages/` por não ser módulo de negócio).
2. Adiciona `"@namespace/shared": "*"` em `dependencies` de `apps/frontend`, `apps/backend`
   e de **todos** os módulos de negócio existentes em `modules/*`.
   **Nenhum código do frontend/backend é alterado.**
   (A skill `config-new-module` também adiciona essa dependência aos módulos criados depois.)
3. Garante `ts-node` na raiz (necessário para `jest.config.ts`) e `packages/*` nos workspaces.
4. `npm install` → `npm run build` e `npm run test:coverage` **somente** em `packages/shared`
   (limite de cobertura de 100% configurado no Jest).

## Estrutura criada

```
packages/shared/src/
├── index.ts                      # exporta tudo
├── error/                        # *.error.ts
│   ├── domain.error.ts           # DomainError extends Error (statusCode 500)
│   ├── validation.error.ts       # ValidationError 422 (fieldCode, errorCode, fullCode)
│   ├── not-found.error.ts        # NotFoundError 404
│   └── unauthorized.error.ts     # UnauthorizedError 401
├── validation/
│   ├── validation-rule.interface.ts  # validate(value): string | null (código do erro ou null)
│   ├── validator.ts              # Validator (campo) + Validator.validateAll / Validator.assert (vários campos)
│   ├── validation.exception.ts   # ValidationException: uma única exceção com todos os erros
│   ├── rule.utils.ts             # utilitários usados por várias regras
│   └── rules/                    # <nome>.rule.ts (kebab-case) + teste; index.ts só com exports
├── model/entity.ts               # Entity<TState extends EntityState>
├── usecase/use-case.ts           # UseCase<I, O> { execute(input: I): Promise<O> }
└── data/                         # *.repository.ts
    ├── create-entity.repository.ts, update-entity.repository.ts, delete-entity.repository.ts
    ├── find-by-id.repository.ts, find-page.repository.ts (PageRequest, Page)
    └── crud.repository.ts        # CrudRepository herda de todos
```

### Convenções das regras

- Cada regra implementa `ValidationRule` e retorna o **código de erro** ou `null`.
- Regras ignoram `null`/`undefined` (campo opcional), exceto `RequiredRule`,
  `NotNullRule` e `NotUndefinedRule`, que existem justamente para isso.
- Regras de vários valores recebem arrays (`InRule`/`NotInRule` validam cada item;
  `UniqueItemsRule`, `MinItemsRule`, `MaxItemsRule` trabalham sobre o array).
- `error.fullCode` = `"<fieldCode>.<errorCode>"` (ex.: `user.email.invalid.email`) é a chave de i18n.
  O catálogo de mensagens **não** faz parte deste módulo.

### Exemplo de uso numa entidade

```ts
import { Entity, EntityState, ValidationError, Validator, RequiredRule, EmailRule } from '@meu-projeto/shared';

interface UserState extends EntityState { name: string; email: string }

export class User extends Entity<UserState> {
  protected validate(): ValidationError[] {
    return Validator.validateAll([
      { fieldCode: 'user.name', value: this.state.name, rules: [new RequiredRule()] },
      { fieldCode: 'user.email', value: this.state.email, rules: [new RequiredRule(), new EmailRule()] },
    ]);
  }
}
// new User({...}) lança ValidationException se inválido; user.clone({ email }) gera cópia validada.
```

## Ao terminar

Informe o pacote criado, quais `package.json` receberam a dependência e o resultado
do build e da cobertura. Se falhar, reporte o `[ERRO]` exatamente como apareceu.
