/** Inserção de uma entidade. */
export interface CreateEntityRepository<TEntity> {
  create(entity: TEntity): Promise<TEntity>;
}
