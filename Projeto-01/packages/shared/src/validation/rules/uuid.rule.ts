import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class UuidRule implements ValidationRule {
  readonly errorCode = 'invalid.uuid';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) ? null : this.errorCode;
  }
}
