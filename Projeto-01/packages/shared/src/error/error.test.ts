import { DomainError, NotFoundError, UnauthorizedError, ValidationError } from './index';

describe('errors', () => {
  it('DomainError herda de Error com status 500', () => {
    const err = new DomainError('falha');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe('falha');
    expect(err.name).toBe('DomainError');
  });

  it('ValidationError tem status 422 e fullCode', () => {
    const err = new ValidationError('user.email', 'invalid.email');
    expect(err).toBeInstanceOf(DomainError);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.statusCode).toBe(422);
    expect(err.fieldCode).toBe('user.email');
    expect(err.errorCode).toBe('invalid.email');
    expect(err.fullCode).toBe('user.email.invalid.email');
    expect(err.message).toBe('user.email.invalid.email');
    expect(new ValidationError('a', 'b', 'msg').message).toBe('msg');
  });

  it('NotFoundError tem status 404', () => {
    const err = new NotFoundError();
    expect(err).toBeInstanceOf(DomainError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.name).toBe('NotFoundError');
    expect(new NotFoundError('user').message).toBe('user');
  });

  it('UnauthorizedError tem status 401', () => {
    const err = new UnauthorizedError();
    expect(err).toBeInstanceOf(DomainError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
    expect(new UnauthorizedError('token').message).toBe('token');
  });
});
