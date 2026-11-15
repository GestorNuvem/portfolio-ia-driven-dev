import { CreateEntityRepository } from './create-entity.repository';
import { DeleteEntityRepository } from './delete-entity.repository';
import { FindByIdRepository } from './find-by-id.repository';
import { FindPageRepository } from './find-page.repository';
import { UpdateEntityRepository } from './update-entity.repository';

/** CRUD completo: herda de todas as interfaces de repositório. */
export interface CrudRepository<TEntity, TId = string, TFilter = unknown>
  extends CreateEntityRepository<TEntity>,
    UpdateEntityRepository<TEntity>,
    DeleteEntityRepository<TId>,
    FindByIdRepository<TEntity, TId>,
    FindPageRepository<TEntity, TFilter> {}
