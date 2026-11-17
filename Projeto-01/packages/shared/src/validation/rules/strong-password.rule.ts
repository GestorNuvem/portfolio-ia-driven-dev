import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';
import { HasLowerCaseRule } from './has-lower-case.rule';
import { HasNumberRule } from './has-number.rule';
import { HasSpecialCharRule } from './has-special-char.rule';
import { HasUpperCaseRule } from './has-upper-case.rule';

export class StrongPasswordRule implements ValidationRule {
  readonly errorCode = 'strong.password';
  private readonly requirements: ValidationRule[] = [
    new HasUpperCaseRule(),
    new HasLowerCaseRule(),
    new HasNumberRule(),
    new HasSpecialCharRule(),
  ];

  constructor(private readonly minLength: number = 8) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!isString(value) || value.length < this.minLength) return this.errorCode;
    return this.requirements.every((rule) => rule.validate(value) === null) ? null : this.errorCode;
  }
}
