import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches, onlyDigits } from '../rule.utils';

function checkDigit(digits: string, length: number): number {
  let sum = 0;
  for (let i = 0; i < length; i++) sum += Number(digits[i]) * (length + 1 - i);
  const rest = (sum * 10) % 11;
  return rest === 10 ? 0 : rest;
}

export class CpfRule implements ValidationRule {
  readonly errorCode = 'invalid.cpf';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!matches(value, /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/)) return this.errorCode;
    const digits = onlyDigits(value as string);
    if (/^(\d)\1{10}$/.test(digits)) return this.errorCode;
    return checkDigit(digits, 9) === Number(digits[9]) && checkDigit(digits, 10) === Number(digits[10])
      ? null
      : this.errorCode;
  }
}
