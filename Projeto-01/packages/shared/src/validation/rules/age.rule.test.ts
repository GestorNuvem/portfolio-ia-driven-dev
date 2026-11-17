import { AgeRule } from './age.rule';

describe('AgeRule', () => {
  const rule = new AgeRule(18, 60, () => new Date('2024-06-15T12:00:00Z'));

  it('expõe o errorCode "age.range"', () => {
    expect(rule.errorCode).toBe('age.range');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2006-06-15T12:00:00Z'], ['2000-01-01T12:00:00Z'], ['1964-06-15T12:00:00Z']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2006-06-20T12:00:00Z'], ['2006-08-01T12:00:00Z'], ['1960-01-01T12:00:00Z'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('age.range');
  });

  it('usa a data atual por padrão', () => {
    expect(new AgeRule(0, 200).validate('1990-01-01')).toBeNull();
  });
});
