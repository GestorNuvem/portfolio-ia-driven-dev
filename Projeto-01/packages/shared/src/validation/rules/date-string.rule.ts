import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

const ISO_8601 =
  /^(\d{4})-(\d{2})-(\d{2})(?:T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?)?$/;

export class DateStringRule implements ValidationRule {
  readonly errorCode = 'date.string';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const match = isString(value) ? ISO_8601.exec(value) : null;
    if (match === null) return this.errorCode;
    const [, year, month, day] = match;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return date.toISOString().slice(0, 10) === `${year}-${month}-${day}` ? null : this.errorCode;
  }
}
