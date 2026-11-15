import { ValidationRule } from '../validation-rule.interface';

export class NotNullRule implements ValidationRule {
  readonly errorCode = 'not.null';

  validate(value: unknown): string | null {
    return value === null ? this.errorCode : null;
  }
}
