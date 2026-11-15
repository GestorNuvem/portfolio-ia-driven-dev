import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class DateRangeRule implements ValidationRule {
  readonly errorCode = 'date.range';
  private readonly minTime: number;
  private readonly maxTime: number;

  constructor(min: Date | string | number, max: Date | string | number) {
    this.minTime = new Date(min).getTime();
    this.maxTime = new Date(max).getTime();
  }

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const date = toDate(value);
    if (date === null) return this.errorCode;
    const time = date.getTime();
    return time >= this.minTime && time <= this.maxTime ? null : this.errorCode;
  }
}
