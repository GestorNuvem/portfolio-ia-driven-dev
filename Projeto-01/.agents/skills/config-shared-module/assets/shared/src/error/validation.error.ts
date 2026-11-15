import { DomainError } from './domain.error';

/**
 * Erro de validação de um campo (422).
 * `fullCode` (ex.: "user.email.invalid.email") é a chave de i18n da mensagem.
 */
export class ValidationError extends DomainError {
  override readonly statusCode: number = 422;
  readonly fullCode: string;

  constructor(
    readonly fieldCode: string,
    readonly errorCode: string,
    message?: string,
  ) {
    super(message ?? `${fieldCode}.${errorCode}`);
    this.fullCode = `${fieldCode}.${errorCode}`;
  }
}
