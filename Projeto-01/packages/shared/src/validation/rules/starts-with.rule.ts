import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class StartsWithRule implements ValidationRule {
  readonly errorCode = 'starts.with';

  constructor(private readonly prefix: string) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value.startsWith(this.prefix) ? null : this.errorCode;
  }
}
