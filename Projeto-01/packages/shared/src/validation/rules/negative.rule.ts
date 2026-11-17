import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class NegativeRule implements ValidationRule {
  readonly errorCode = 'negative';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && value < 0 ? null : this.errorCode;
  }
}
