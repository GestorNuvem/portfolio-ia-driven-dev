import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class TrimRule implements ValidationRule {
  readonly errorCode = 'trim';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value === value.trim() ? null : this.errorCode;
  }
}
