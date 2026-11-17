import { UuidRule } from './uuid.rule';

describe('UuidRule', () => {
  const rule = new UuidRule();

  it('expõe o errorCode "invalid.uuid"', () => {
    expect(rule.errorCode).toBe('invalid.uuid');
  });

  it.each([null, undefined])('ignora valor ausente (%p)', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['9b2c3f4e-1a2b-4c3d-8e9f-0a1b2c3d4e5f'], ['9B2C3F4E-1A2B-4C3D-AE9F-0A1B2C3D4E5F']] as unknown[][])('aceita %p', (value) => {
    expect(rule.validate(value)).toBeNull();
  });

  it.each([['9b2c3f4e-1a2b-1c3d-8e9f-0a1b2c3d4e5f'], ['not-a-uuid'], [1]] as unknown[][])('rejeita %p', (value) => {
    expect(rule.validate(value)).toBe('invalid.uuid');
  });
});
