import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class MinValueRule implements ValidationRule {
  readonly errorCode = 'min.value';

  constructor(private readonly min: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && value >= this.min ? null : this.errorCode;
  }
}
