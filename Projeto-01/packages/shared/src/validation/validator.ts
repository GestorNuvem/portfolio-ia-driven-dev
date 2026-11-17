import { ValidationError } from '../error/validation.error';
import { ValidationRule } from './validation-rule.interface';
import { ValidationException } from './validation.exception';

/** Um campo a ser validado: código do campo, valor e todas as regras daquele campo. */
export interface FieldValidation {
  fieldCode: string; // ex: "user.email"
  value: unknown;
  rules: ValidationRule<any>[];
}

/**
 * Executa todas as regras e acumula os erros — nunca para no primeiro.
 * - instância: valida um campo (`new Validator('user.email', rules).validate(value)`)
 * - `Validator.validateAll(fields)`: valida um conjunto de campos e junta todos os erros
 * - `Validator.assert(fields)`: lança uma única `ValidationException` se houver erros
 */
export class Validator {
  constructor(
    readonly fieldCode: string,
    readonly rules: ValidationRule<any>[],
  ) {}

  validate(value: unknown): ValidationError[] {
    const errors: ValidationError[] = [];
    for (const rule of this.rules) {
      const errorCode = rule.validate(value);
      if (errorCode !== null) errors.push(new ValidationError(this.fieldCode, errorCode));
    }
    return errors;
  }

  static validateAll(fields: FieldValidation[]): ValidationError[] {
    return fields.flatMap((field) => new Validator(field.fieldCode, field.rules).validate(field.value));
  }

  static assert(fields: FieldValidation[]): void {
    const errors = Validator.validateAll(fields);
    if (errors.length > 0) throw new ValidationException(errors);
  }
}
