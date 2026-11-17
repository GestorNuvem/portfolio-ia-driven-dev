import { ValidationError } from '../error/validation.error';
import { EmailRule, MinLengthRule, RequiredRule } from './rules';
import { ValidationException } from './validation.exception';
import { Validator } from './validator';

describe('Validator', () => {
  it('acumula todos os erros de um campo (nunca para no primeiro)', () => {
    const validator = new Validator('user.email', [new RequiredRule(), new EmailRule(), new MinLengthRule(5)]);
    const errors = validator.validate('a@');
    expect(errors.map((e) => e.fullCode)).toEqual(['user.email.invalid.email', 'user.email.min.length']);
    expect(errors[0]).toBeInstanceOf(ValidationError);
  });

  it('retorna lista vazia quando o valor é válido', () => {
    expect(new Validator('user.email', [new RequiredRule(), new EmailRule()]).validate('a@b.com')).toEqual([]);
  });

  it('valida vários campos e junta todos os erros', () => {
    const errors = Validator.validateAll([
      { fieldCode: 'user.name', value: '', rules: [new RequiredRule()] },
      { fieldCode: 'user.email', value: 'x', rules: [new RequiredRule(), new EmailRule()] },
      { fieldCode: 'user.password', value: 'abcdefgh', rules: [new MinLengthRule(8)] },
    ]);
    expect(errors.map((e) => e.fullCode)).toEqual(['user.name.required', 'user.email.invalid.email']);
  });

  it('assert lança uma única ValidationException com todos os erros', () => {
    const fields = [
      { fieldCode: 'user.name', value: undefined, rules: [new RequiredRule()] },
      { fieldCode: 'user.email', value: 'x', rules: [new EmailRule()] },
    ];
    expect(() => Validator.assert(fields)).toThrow(ValidationException);
    try {
      Validator.assert(fields);
    } catch (err) {
      const exception = err as ValidationException;
      expect(exception.statusCode).toBe(422);
      expect(exception.errors).toHaveLength(2);
      expect(exception.message).toBe('Validation failed: user.name.required, user.email.invalid.email');
    }
  });

  it('assert não lança quando tudo é válido', () => {
    expect(() => Validator.assert([{ fieldCode: 'user.name', value: 'Ana', rules: [new RequiredRule()] }])).not.toThrow();
  });
});
