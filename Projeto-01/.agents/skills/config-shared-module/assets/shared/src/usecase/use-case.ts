/**
 * Caso de uso (Application Service): um único método `execute`,
 * que recebe uma entrada do tipo I e retorna uma Promise da saída do tipo O.
 */
export interface UseCase<I, O> {
  execute(input: I): Promise<O>;
}
