import { ValidationRule } from '../validation-rule.interface';
import { isEqual, isNullish } from '../rule.utils';

export class NotInRule implements ValidationRule {
  readonly errorCode = 'not.in';

  constructor(private readonly blocked: unknown[]) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const values = Array.isArray(value) ? value : [value];
    return values.some((item) => this.blocked.some((blocked) => isEqual(blocked, item))) ? this.errorCode : null;
  }
}
