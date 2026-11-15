import { PhoneRule } from './phone.rule';

describe('PhoneRule', () => {
  const rule = new PhoneRule();

  it('expõe o errorCode "invalid.phone"', () => {
    expect(rule.errorCode).toBe('invalid.phone');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['+5511912345678'], ['+14155552671']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['11912345678'], ['+0123'], ['+55 11 91234'], [5511912345678]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.phone');
  });

  it('aceita um padrão customizado', () => {
    const custom = new PhoneRule(/^\d{4}-\d{4}$/);
    expect(custom.validate('1234-5678')).toBeNull();
    expect(custom.validate('+5511912345678')).toBe('invalid.phone');
  });
});
