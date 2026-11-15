import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class DateRule implements ValidationRule {
  readonly errorCode = 'invalid.date';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return toDate(value) !== null ? null : this.errorCode;
  }
}
