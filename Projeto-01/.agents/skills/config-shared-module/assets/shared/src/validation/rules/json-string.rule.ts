import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

export class JsonStringRule implements ValidationRule {
  readonly errorCode = 'json.string';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!isString(value)) return this.errorCode;
    try {
      JSON.parse(value);
      return null;
    } catch {
      return this.errorCode;
    }
  }
}
