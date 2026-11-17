import { ValidationRule } from '../validation-rule.interface';
import { isNullish, lengthOf } from '../rule.utils';

export class MinLengthRule implements ValidationRule {
  readonly errorCode = 'min.length';

  constructor(private readonly min: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const length = lengthOf(value);
    return length !== null && length >= this.min ? null : this.errorCode;
  }
}
