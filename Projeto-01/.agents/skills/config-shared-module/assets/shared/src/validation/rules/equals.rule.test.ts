import { EqualsRule } from './equals.rule';

describe('EqualsRule', () => {
  const rule = new EqualsRule({ a: [1, 2] });

  it('expõe o errorCode "equals"', () => {
    expect(rule.errorCode).toBe('equals');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[{ a: [1, 2] }]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([[{ a: [1, 3] }], ['x']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('equals');
  });
});
