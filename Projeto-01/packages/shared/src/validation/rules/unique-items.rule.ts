import { ValidationRule } from '../validation-rule.interface';
import { isEqual, isNullish } from '../rule.utils';

export class UniqueItemsRule implements ValidationRule {
  readonly errorCode = 'unique.items';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!Array.isArray(value)) return this.errorCode;
    const unique = value.every((item, index) => value.findIndex((other) => isEqual(other, item)) === index);
    return unique ? null : this.errorCode;
  }
}
