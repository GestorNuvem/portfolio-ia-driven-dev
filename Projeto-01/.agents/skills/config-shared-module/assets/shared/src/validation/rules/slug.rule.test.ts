import { SlugRule } from './slug.rule';

describe('SlugRule', () => {
  const rule = new SlugRule();

  it('expõe o errorCode "slug"', () => {
    expect(rule.errorCode).toBe('slug');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['meu-texto-aqui'], ['abc']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['Meu-Texto'], ['a--b'], ['-a'], ['a b'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('slug');
  });
});
