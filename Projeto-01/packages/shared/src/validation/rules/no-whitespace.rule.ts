import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class NoWhitespaceRule implements ValidationRule {
  readonly errorCode = 'no.whitespace';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && !/\s/.test(value) ? null : this.errorCode;
  }
}
