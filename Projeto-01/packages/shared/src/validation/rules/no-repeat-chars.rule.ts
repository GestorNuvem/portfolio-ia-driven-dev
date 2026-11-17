import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class NoRepeatCharsRule implements ValidationRule {
  readonly errorCode = 'repeat.chars';

  constructor(private readonly maxRepeat: number = 2) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && !new RegExp(`(.)\\1{${this.maxRepeat}}`).test(value) ? null : this.errorCode;
  }
}
