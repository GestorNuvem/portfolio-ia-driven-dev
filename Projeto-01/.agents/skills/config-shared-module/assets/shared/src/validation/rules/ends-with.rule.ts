import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class EndsWithRule implements ValidationRule {
  readonly errorCode = 'ends.with';

  constructor(private readonly suffix: string) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return isString(value) && value.endsWith(this.suffix) ? null : this.errorCode;
  }
}
