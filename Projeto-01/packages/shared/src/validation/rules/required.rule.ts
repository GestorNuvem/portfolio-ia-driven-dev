import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class RequiredRule implements ValidationRule {
  readonly errorCode = 'required';

  validate(value: unknown): string | null {
    if (isNullish(value)) return this.errorCode;
    if (isString(value) && value.trim() === '') return this.errorCode;
    if (Array.isArray(value) && value.length === 0) return this.errorCode;
    return null;
  }
}
