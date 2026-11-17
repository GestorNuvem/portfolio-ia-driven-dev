import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class CepRule implements ValidationRule {
  readonly errorCode = 'invalid.cep';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^\d{5}-\d{3}$/) ? null : this.errorCode;
  }
}
