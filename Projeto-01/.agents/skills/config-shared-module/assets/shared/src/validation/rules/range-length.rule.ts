import { ValidationRule } from '../validation-rule.interface';
import { isNullish, lengthOf } from '../rule.utils';

export class RangeLengthRule implements ValidationRule {
  readonly errorCode = 'range.length';

  constructor(private readonly min: number, private readonly max: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const length = lengthOf(value);
    return length !== null && length >= this.min && length <= this.max ? null : this.errorCode;
  }
}
