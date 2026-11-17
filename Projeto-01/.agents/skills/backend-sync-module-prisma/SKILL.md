---
name: backend-sync-module-prisma
description: Sincroniza as entidades de um módulo de negócio (modules/<nome>/src/**/model/*.entity.ts) com o schema do Prisma do backend (apps/backend/prisma/schema.prisma) e cria/atualiza os repositórios Prisma em apps/backend/src/modules/<nome>. Use sempre que o usuário pedir para sincronizar/mapear entidades de um módulo com o Prisma, criar tabelas, atualizar o schema do banco ou implementar repositórios Prisma de um módulo.
---

# backend-sync-module-prisma

Lê as entidades de um módulo de negócio e reflete cada uma delas como um `model` no
schema do Prisma do backend, mantendo o padrão de nomenclatura abaixo. Depois gera o
client e implementa os repositórios (interfaces de `modules/<nome>/src/**/provider/*.repository.ts`)
dentro de `apps/backend/src/modules/<nome>/`.

## Onde ficam as coisas

| O quê | Caminho |
| --- | --- |
| Schema | `apps/backend/prisma/schema.prisma` |
| Configuração do Prisma (URL do banco) | `apps/backend/prisma.config.ts` (lê `DATABASE_URL` do `.env`) |
| Client gerado | `apps/backend/src/generated/prisma` (não versionar) |
| Serviço Nest do Prisma | `apps/backend/src/db/prisma.service.ts` + `prisma.module.ts` |
| Repositórios Prisma | `apps/backend/src/modules/<nome>/<entidade>.prisma.repository.ts` |

## Padrão de nomenclatura no banco de dados (obrigatório)

O nome do `model` no Prisma segue a entidade (PascalCase, singular — ex.: `User`),
mas **o nome físico no banco** segue sempre estas regras:

1. **Tabelas**: letras **minúsculas**, palavras separadas por **underline** (`snake_case`)
   e, sempre que possível, no **plural** — use `@@map`.
   - `User` → `users`
   - `Category` → `categories`
   - `UserProfile` → `user_profiles`
   - `BankAccount` → `bank_accounts`
   - Plural em inglês: `+s` (`user` → `users`), `y` → `ies` (`category` → `categories`),
     `s/x/z/ch/sh` → `+es` (`address` → `addresses`). Em um nome composto, só a
     **última palavra** vai para o plural (`user_profiles`).
2. **Colunas**: também minúsculas em `snake_case` — use `@map` em todo campo cujo nome
   tenha mais de uma palavra (`createdAt` → `created_at`, `deletedAt` → `deleted_at`,
   `userId` → `user_id`). Campos de uma palavra (`id`, `name`, `email`) já ficam corretos.
3. **Chaves estrangeiras / relações**: coluna `<entidade_singular>_id` (ex.: `user_id`).

Exemplo:

```prisma
model User {
  id        String    @id @db.Uuid
  name      String    @db.VarChar(80)
  email     String    @unique
  password  String
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}
```

## Mapeamento entidade → Prisma

- `id` (UUID v4 gerado pela entidade base) → `String @id @db.Uuid` (sem `@default`: o id vem do domínio).
- `string` → `String` (use `@db.VarChar(n)` quando a entidade tiver `MaxLengthRule(n)`).
- `number` → `Int` ou `Decimal` conforme as regras (`IntegerRule` → `Int`).
- `boolean` → `Boolean`; `Date` → `DateTime`.
- Campos opcionais da entidade (`?`) → tipo opcional no Prisma (`?`).
- `EmailRule` em campo que identifica o registro → `@unique`.
- Datas herdadas da entidade base: `createdAt`, `updatedAt` (obrigatórias) e `deletedAt` (opcional),
  sempre com `@map` em snake_case.

## Passos

1. Ler as entidades (`*.entity.ts`) e as interfaces de repositório do módulo.
2. Atualizar `apps/backend/prisma/schema.prisma` seguindo o padrão de nomenclatura acima
   (nunca remover models de outros módulos).
3. Rodar em `apps/backend`: `npx prisma generate` (e `npx prisma migrate dev --name <descricao>`
   quando houver banco disponível).
4. Implementar o repositório Prisma de cada interface, convertendo `registro ↔ entidade`
   (a entidade é recriada com `new Entidade({...})`, o que revalida o estado).
5. Registrar o repositório como provider no módulo Nest correspondente.
6. Rodar `npm run build` no backend e reportar o resultado.
