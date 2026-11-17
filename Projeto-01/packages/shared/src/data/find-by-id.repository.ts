/** Consulta de uma entidade pelo id; `null` quando não encontrada. */
export interface FindByIdRepository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>;
}
