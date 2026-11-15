import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class HexColorRule implements ValidationRule {
  readonly errorCode = 'hex.color';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/) ? null : this.errorCode;
  }
}
