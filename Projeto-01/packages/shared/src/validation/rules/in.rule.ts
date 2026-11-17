import { ValidationRule } from '../validation-rule.interface';
import { isEqual, isNullish } from '../rule.utils';

export class InRule implements ValidationRule {
  readonly errorCode = 'in';

  constructor(private readonly allowed: unknown[]) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const values = Array.isArray(value) ? value : [value];
    return values.every((item) => this.allowed.some((allowed) => isEqual(allowed, item))) ? null : this.errorCode;
  }
}
