import { NotInRule } from './not-in.rule';

describe('NotInRule', () => {
  const rule = new NotInRule(['root', 'admin']);

  it('expõe o errorCode "not.in"', () => {
    expect(rule.errorCode).toBe('not.in');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['user'], [['user', 'guest']]] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['root'], [['user', 'admin']]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('not.in');
  });
});
