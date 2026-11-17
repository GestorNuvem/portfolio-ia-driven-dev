import { PhoneBrRule } from './phone-br.rule';

describe('PhoneBrRule', () => {
  const rule = new PhoneBrRule();

  it('expõe o errorCode "invalid.phone.br"', () => {
    expect(rule.errorCode).toBe('invalid.phone.br');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['(11) 91234-5678'], ['11912345678'], ['+55 11 91234-5678'], ['(21) 3456-7890']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['(01) 91234-5678'], ['(11) 81234-5678'], ['1234-5678'], [11912345678]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.phone.br');
  });
});
