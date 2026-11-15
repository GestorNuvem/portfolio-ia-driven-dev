import { NotEqualsRule } from './not-equals.rule';

describe('NotEqualsRule', () => {
  const rule = new NotEqualsRule('admin');

  it('expõe o errorCode "not.equals"', () => {
    expect(rule.errorCode).toBe('not.equals');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['user']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['admin']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('not.equals');
  });
});
