import { FutureDateRule } from './future-date.rule';

describe('FutureDateRule', () => {
  const rule = new FutureDateRule(() => new Date('2024-06-15T00:00:00Z'));

  it('expõe o errorCode "future.date"', () => {
    expect(rule.errorCode).toBe('future.date');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-06-16']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['2024-06-15T00:00:00Z'], ['2024-01-01'], ['abc']] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('future.date');
  });

  it('usa a data atual por padrão', () => {
    expect(new FutureDateRule().validate('3000-01-01')).toBeNull();
    expect(new FutureDateRule().validate('2000-01-01')).toBe('future.date');
  });
});
