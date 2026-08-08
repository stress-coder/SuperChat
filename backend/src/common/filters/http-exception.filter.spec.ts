import { HttpException, HttpStatus, type ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    host = {
      switchToHttp: () => ({
        getResponse: () => response,
      }),
    } as unknown as ArgumentsHost;
  });

  it('formats a HttpException with an object response body', () => {
    const exception = new HttpException(
      { message: 'Invalid credentials.', error: 'Unauthorized' },
      HttpStatus.UNAUTHORIZED,
    );

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(response.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid credentials.',
      error: 'Unauthorized',
    });
  });

  it('formats a HttpException with a plain string response body', () => {
    const exception = new HttpException('Not found.', HttpStatus.NOT_FOUND);

    filter.catch(exception, host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Not found.',
      }),
    );
  });

  it('falls back to a 500 with a generic message for a non-HTTP exception', () => {
    filter.catch(new Error('boom'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      }),
    );
  });
});
