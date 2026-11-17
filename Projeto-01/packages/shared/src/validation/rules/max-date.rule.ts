import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class MaxDateRule implements ValidationRule {
  readonly errorCode = 'max.date';
  private readonly maxTime: number;

  constructor(max: Date | string | number) {
    this.maxTime = new Date(max).getTime();
  }

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const date = toDate(value);
    return date !== null && date.getTime() <= this.maxTime ? null : this.errorCode;
  }
}
