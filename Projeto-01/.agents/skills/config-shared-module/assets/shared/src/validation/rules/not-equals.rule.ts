import { ValidationRule } from '../validation-rule.interface';
import { isEqual, isNullish } from '../rule.utils';

export class NotEqualsRule implements ValidationRule {
  readonly errorCode = 'not.equals';

  constructor(private readonly forbidden: unknown) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isEqual(value, this.forbidden) ? this.errorCode : null;
  }
}
