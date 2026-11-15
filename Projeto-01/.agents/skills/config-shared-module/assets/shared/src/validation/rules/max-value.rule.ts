import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class MaxValueRule implements ValidationRule {
  readonly errorCode = 'max.value';

  constructor(private readonly max: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && value <= this.max ? null : this.errorCode;
  }
}
