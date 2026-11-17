import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class PastDateRule implements ValidationRule {
  readonly errorCode = 'past.date';

  constructor(private readonly now: () => Date = () => new Date()) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const date = toDate(value);
    return date !== null && date.getTime() < this.now().getTime() ? null : this.errorCode;
  }
}
