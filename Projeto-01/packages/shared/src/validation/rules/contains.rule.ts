import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class ContainsRule implements ValidationRule {
  readonly errorCode = 'contains';

  constructor(private readonly substring: string) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value.includes(this.substring) ? null : this.errorCode;
  }
}
