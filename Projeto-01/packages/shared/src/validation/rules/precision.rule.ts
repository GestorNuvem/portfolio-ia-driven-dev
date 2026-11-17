import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isNumber } from '../rule.utils';

export class PrecisionRule implements ValidationRule {
  readonly errorCode = 'precision';

  constructor(private readonly maxDecimals: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isNumber(value) && Number.isFinite(value) && Number(value.toFixed(this.maxDecimals)) === value
      ? null
      : this.errorCode;
  }
}
