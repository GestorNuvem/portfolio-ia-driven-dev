import { DomainError } from '../error/domain.error';
import { ValidationError } from '../error/validation.error';

/** Exceção única lançada com a lista completa de erros de validação de uma entidade. */
export class ValidationException extends DomainError {
  override readonly statusCode: number = 422;

  constructor(readonly errors: ValidationError[]) {
    super(`Validation failed: ${errors.map((e) => e.fullCode).join(', ')}`);
  }
}
