import { ValidationRule } from '../validation-rule.interface';
import { isNullish, matches, onlyDigits } from '../rule.utils';

const WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function checkDigit(digits: string, length: number): number {
  const weights = WEIGHTS.slice(WEIGHTS.length - length);
  const sum = weights.reduce((acc, weight, i) => acc + Number(digits[i]) * weight, 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

export class CnpjRule implements ValidationRule {
  readonly errorCode = 'invalid.cnpj';

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!matches(value, /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/)) return this.errorCode;
    const digits = onlyDigits(value as string);
    if (/^(\d)\1{13}$/.test(digits)) return this.errorCode;
    return checkDigit(digits, 12) === Number(digits[12]) && checkDigit(digits, 13) === Number(digits[13])
      ? null
      : this.errorCode;
  }
}
