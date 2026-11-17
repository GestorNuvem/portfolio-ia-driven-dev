import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class LowerCaseRule implements ValidationRule {
  readonly errorCode = 'lower.case';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value === value.toLowerCase() ? null : this.errorCode;
  }
}
