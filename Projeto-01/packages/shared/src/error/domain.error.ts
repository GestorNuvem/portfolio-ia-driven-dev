/**
 * Classe base de todos os erros da aplicação.
 * As subclasses sobrescrevem `statusCode` de acordo com o tipo de erro.
 */
export class DomainError extends Error {
  readonly statusCode: number = 500;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
