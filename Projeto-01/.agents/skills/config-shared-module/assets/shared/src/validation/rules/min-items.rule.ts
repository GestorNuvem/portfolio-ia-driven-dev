import { ValidationRule } from '../validation-rule.interface';
import { isNullish } from '../rule.utils';

export class MinItemsRule implements ValidationRule {
  readonly errorCode = 'min.items';

  constructor(private readonly min: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return Array.isArray(value) && value.length >= this.min ? null : this.errorCode;
  }
}
