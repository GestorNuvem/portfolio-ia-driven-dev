import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches } from '../rule.utils';

export class RegexRule implements ValidationRule {
  private readonly pattern: RegExp;

  constructor(
    pattern: RegExp,
    readonly errorCode: string = 'regex',
  ) {
    // remove a flag "g" para que `test` não guarde estado entre chamadas
    this.pattern = new RegExp(pattern.source, pattern.flags.replace('g', ''));
  }

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    return matches(value, this.pattern) ? null : this.errorCode;
  }
}
