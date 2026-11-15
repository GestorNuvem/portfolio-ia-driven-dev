import { UrlRule } from './url.rule';

describe('UrlRule', () => {
  const rule = new UrlRule();

  it('expõe o errorCode "invalid.url"', () => {
    expect(rule.errorCode).toBe('invalid.url');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['http://site.com'], ['https://site.com/a?b=1']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ftp://site.com'], ['site.com'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.url');
  });
});
