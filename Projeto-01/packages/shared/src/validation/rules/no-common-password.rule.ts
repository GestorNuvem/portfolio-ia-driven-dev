import { ValidationRule } from '../validation-rule.interface';
import { isNullish, isString } from '../rule.utils';

const COMMON_PASSWORDS = [
  '123456', '12345678', '123456789', '1234567890', '12345', '1234', '111111', '000000',
  'password', 'senha', 'senha123', 'qwerty', 'abc123', 'admin', 'admin123', 'iloveyou',
  'welcome', 'letmein', 'monkey', 'dragon', '654321', '123123', 'password1', 'qwerty123',
];

export class NoCommonPasswordRule implements ValidationRule {
  readonly errorCode = 'common.password';
  private readonly blacklist: Set<string>;

  constructor(blacklist: string[] = COMMON_PASSWORDS) {
    this.blacklist = new Set(blacklist.map((item) => item.toLowerCase()));
  }

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    if (!isString(value)) return this.errorCode;
    return this.blacklist.has(value.toLowerCase()) ? this.errorCode : null;
  }
}
