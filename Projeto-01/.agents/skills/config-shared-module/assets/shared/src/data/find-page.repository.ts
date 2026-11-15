/** Parâmetros de uma consulta paginada (page começa em 1). */
export interface PageRequest<TFilter = unknown> {
  page: number;
  pageSize: number;
  filter?: TFilter;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
}

/** Resposta de uma consulta paginada. */
export interface Page<TEntity> {
  items: TEntity[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Consulta paginada de entidades. */
export interface FindPageRepository<TEntity, TFilter = unknown> {
  findPage(request: PageRequest<TFilter>): Promise<Page<TEntity>>;
}
