import { EndsWithRule } from './ends-with.rule';

describe('EndsWithRule', () => {
  const rule = new EndsWithRule('.ts');

  it('expõe o errorCode "ends.with"', () => {
    expect(rule.errorCode).toBe('ends.with');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['index.ts']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['index.js'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('ends.with');
  });
});
