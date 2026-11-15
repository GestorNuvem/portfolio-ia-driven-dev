import { JsonStringRule } from './json-string.rule';

describe('JsonStringRule', () => {
  const rule = new JsonStringRule();

  it('expõe o errorCode "json.string"', () => {
    expect(rule.errorCode).toBe('json.string');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['{"a":1}'], ['[1,2]'], ['"x"']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['{a:1}'], [''], [{}]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('json.string');
  });
});
