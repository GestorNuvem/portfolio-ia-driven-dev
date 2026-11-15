import { ValidationRule } from '../validation-rule.interface';
import { isNullish, lengthOf } from '../rule.utils';

export class MaxLengthRule implements ValidationRule {
  readonly errorCode = 'max.length';

  constructor(private readonly max: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const length = lengthOf(value);
    return length !== null && length <= this.max ? null : this.errorCode;
  }
}
