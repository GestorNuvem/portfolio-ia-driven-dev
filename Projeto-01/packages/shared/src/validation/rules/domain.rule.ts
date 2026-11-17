import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class DomainRule implements ValidationRule {
  readonly errorCode = 'invalid.domain';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, /^(?=.{1,253}$)(?:(?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$/) ? null : this.errorCode;
  }
}
