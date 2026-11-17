import { ValidationRule } from '../validation-rule.interface';

export class NotUndefinedRule implements ValidationRule {
  readonly errorCode = 'not.undefined';

  validate(value: unknown): string | null {
    return value === undefined ? this.errorCode : null;
  }
}
