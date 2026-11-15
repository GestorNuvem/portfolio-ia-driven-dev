import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class UpperCaseRule implements ValidationRule {
  readonly errorCode = 'upper.case';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value === value.toUpperCase() ? null : this.errorCode;
  }
}
