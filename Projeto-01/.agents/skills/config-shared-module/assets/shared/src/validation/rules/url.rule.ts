import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class UrlRule implements ValidationRule {
  readonly errorCode = 'invalid.url';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!isString(value)) return this.errorCode;
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? null : this.errorCode;
    } catch {
      return this.errorCode;
    }
  }
}
