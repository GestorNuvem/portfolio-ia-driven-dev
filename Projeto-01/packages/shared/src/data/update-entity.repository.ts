/** Atualização de uma entidade existente. */
export interface UpdateEntityRepository<TEntity> {
  update(entity: TEntity): Promise<TEntity>;
}
