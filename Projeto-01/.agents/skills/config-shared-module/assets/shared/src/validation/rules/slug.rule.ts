import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class SlugRule implements ValidationRule {
  readonly errorCode = 'slug';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) ? null : this.errorCode;
  }
}
