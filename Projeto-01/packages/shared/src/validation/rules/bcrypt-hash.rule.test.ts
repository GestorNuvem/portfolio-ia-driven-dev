import { BcryptHashRule } from './bcrypt-hash.rule';

const SALT_AND_HASH = 'N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

describe('BcryptHashRule', () => {
  const rule = new BcryptHashRule();

  it('expõe o errorCode "bcrypt.hash"', () => {
    expect(rule.errorCode).toBe('bcrypt.hash');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([
    [`$2a$10$${SALT_AND_HASH}`],
    [`$2b$12$${SALT_AND_HASH}`],
    [`$2x$04$${SALT_AND_HASH}`],
    [`$2y$31$${SALT_AND_HASH}`],
    ['$2b$10$abcdefghijklmnopqrstuv./ABCDEFGHIJKLMNOPQRSTUVWXYZ012'],
  ] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([
    [''],
    ['Abcdef1!'],
    [`$2c$10$${SALT_AND_HASH}`],
    [`$1$10$${SALT_AND_HASH}`],
    [`$2b$03$${SALT_AND_HASH}`],
    [`$2b$32$${SALT_AND_HASH}`],
    [`$2b$5$${SALT_AND_HASH}`],
    [`$2b$10$${SALT_AND_HASH.slice(1)}`],
    [`$2b$10$${SALT_AND_HASH}x`],
    [`$2b$10$${SALT_AND_HASH.slice(1)}!`],
    [` $2b$10$${SALT_AND_HASH}`],
    [12345],
  ] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('bcrypt.hash');
  });
});
