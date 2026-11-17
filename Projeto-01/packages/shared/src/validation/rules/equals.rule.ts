import { ValidationRule } from '../validation-rule.interface';
import { isEqual, isNullish } from '../rule.utils';

export class EqualsRule implements ValidationRule {
  readonly errorCode = 'equals';

  constructor(private readonly expected: unknown) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isEqual(value, this.expected) ? null : this.errorCode;
  }
}
