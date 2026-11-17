import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class PositiveRule implements ValidationRule {
  readonly errorCode = 'positive';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && value > 0 ? null : this.errorCode;
  }
}
