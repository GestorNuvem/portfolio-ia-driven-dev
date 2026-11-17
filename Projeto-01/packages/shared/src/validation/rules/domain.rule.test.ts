import { DomainRule } from './domain.rule';

describe('DomainRule', () => {
  const rule = new DomainRule();

  it('expõe o errorCode "invalid.domain"', () => {
    expect(rule.errorCode).toBe('invalid.domain');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['site.com'], ['sub.site.com.br']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['http://site.com'], ['-site.com'], ['site'], ['site.c'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.domain');
  });
});
