import { ValidationRule } from '../validation-rule.interface';
import { isNullish } from '../rule.utils';

export class MaxItemsRule implements ValidationRule {
  readonly errorCode = 'max.items';

  constructor(private readonly max: number) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return Array.isArray(value) && value.length <= this.max ? null : this.errorCode;
  }
}
