import { DomainError } from './domain.error';

export class UnauthorizedError extends DomainError {
  override readonly statusCode: number = 401;

  constructor(message = 'Unauthorized') {
    super(message);
  }
}
