import { ValidationRule } from '../validation-rule.interface';
import { isNullish } from '../rule.utils';

export class IntegerRule implements ValidationRule {
  readonly errorCode = 'integer';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return Number.isInteger(value) ? null : this.errorCode;
  }
}
