import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class TimeStringRule implements ValidationRule {
  readonly errorCode = 'time.string';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/) ? null : this.errorCode;
  }
}
