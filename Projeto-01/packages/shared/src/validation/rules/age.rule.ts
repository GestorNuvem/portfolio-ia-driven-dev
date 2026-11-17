import { ValidationRule } from '../validation-rule.interface';
import { isNullish, toDate } from '../rule.utils';

export class AgeRule implements ValidationRule {
  readonly errorCode = 'age.range';

  constructor(
    private readonly min: number,
    private readonly max: number,
    private readonly now: () => Date = () => new Date(),
  ) {}

  validate(value: unknown): string | null {
    if (isNullish(value)) return null;
    const birth = toDate(value);
    if (birth === null) return this.errorCode;
    const today = this.now();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
    return age >= this.min && age <= this.max ? null : this.errorCode;
  }
}
