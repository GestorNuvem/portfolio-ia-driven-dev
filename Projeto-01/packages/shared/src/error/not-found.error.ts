import { DomainError } from './domain.error';

export class NotFoundError extends DomainError {
  override readonly statusCode: number = 404;

  constructor(message = 'Not found') {
    super(message);
  }
}
