import { CrudRepository } from '@meu-projeto/shared';
import { User } from '../model/user.entity';

/**
 * Repositório de usuários: CRUD (create, update, delete, findById, findPage)
 * com os tipos genéricos resolvidos para a entidade User (id string, sem filtro específico).
 * Apenas o contrato — as implementações ficam em outras camadas (ex.: backend com Prisma).
 */
export interface UserRepository extends CrudRepository<User, string> {}
