import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { DomainError, ValidationException } from '@meu-projeto/shared';
import type { Response } from 'express';

/**
 * Converte erros de domínio em respostas HTTP usando o `statusCode` de cada erro.
 * ValidationException (422) devolve todos os erros de validação (`fullCode` = chave de i18n).
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body: Record<string, unknown> = {
      statusCode: error.statusCode,
      error: error.name,
      message: error.message,
    };
    if (error instanceof ValidationException) {
      body.errors = error.errors.map((e) => ({ field: e.fieldCode, code: e.errorCode, fullCode: e.fullCode }));
    }
    response.status(error.statusCode).json(body);
  }
}
