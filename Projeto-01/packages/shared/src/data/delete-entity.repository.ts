/** Remoção de uma entidade pelo id. */
export interface DeleteEntityRepository<TId = string> {
  delete(id: TId): Promise<void>;
}
