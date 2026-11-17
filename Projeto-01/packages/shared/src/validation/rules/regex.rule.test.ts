import { RegexRule } from './regex.rule';

describe('RegexRule', () => {
  const rule = new RegexRule(/^[a-z]+$/g);

  it('expõe o errorCode "regex"', () => {
    expect(rule.errorCode).toBe('regex');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['abc']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['ab1'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('regex');
  });

  it('não guarda estado entre chamadas (flag g) e aceita errorCode customizado', () => {
    expect(rule.validate('abc')).toBeNull();
    expect(rule.validate('abc')).toBeNull();
    const custom = new RegexRule(/^\d+$/, 'only.digits');
    expect(custom.errorCode).toBe('only.digits');
    expect(custom.validate('a')).toBe('only.digits');
  });
});
