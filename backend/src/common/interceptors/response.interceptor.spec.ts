import { of } from 'rxjs';
import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  const makeContext = (statusCode = 200): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  it('passes through a handler result that already has message/data', (done) => {
    const handler: CallHandler = {
      handle: () => of({ message: 'Login successful.', data: { id: 'user-1' } }),
    };

    interceptor.intercept(makeContext(201), handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 201,
        message: 'Login successful.',
        data: { id: 'user-1' },
      });
      done();
    });
  });

  it('wraps a raw handler result under a generic Success envelope', (done) => {
    const handler: CallHandler = {
      handle: () => of(['a', 'b']),
    };

    interceptor.intercept(makeContext(200), handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: ['a', 'b'],
      });
      done();
    });
  });

  it('defaults statusCode to 200 when the response has none', (done) => {
    const context = {
      switchToHttp: () => ({ getResponse: () => ({}) }),
    } as unknown as ExecutionContext;
    const handler: CallHandler = { handle: () => of(null) };

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result.statusCode).toBe(200);
      done();
    });
  });
});
