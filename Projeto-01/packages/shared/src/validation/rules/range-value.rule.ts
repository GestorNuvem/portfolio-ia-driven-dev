import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class RangeValueRule implements ValidationRule {
  readonly errorCode = 'range.value';

  constructor(private readonly min: number, private readonly max: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && value >= this.min && value <= this.max ? null : this.errorCode;
  }
}
