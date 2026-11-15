import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class MinDateRule implements ValidationRule {
  readonly errorCode = 'min.date';
  private readonly minTime: number;

  constructor(min: Date | string | number) {
    this.minTime = new Date(min).getTime();
  }

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const date = toDate(value);
    return date !== null && date.getTime() >= this.minTime ? null : this.errorCode;
  }
}
