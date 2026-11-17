import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class FutureDateRule implements ValidationRule {
  readonly errorCode = 'future.date';

  constructor(private readonly now: () => Date = () => new Date()) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const date = toDate(value);
    return date !== null && date.getTime() > this.now().getTime() ? null : this.errorCode;
  }
}
