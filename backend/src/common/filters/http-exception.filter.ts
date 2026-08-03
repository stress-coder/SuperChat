import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const exceptionResponse =
            exception instanceof HttpException ? exception.getResponse() : null;

        let message = 'Internal server error';
        let error = HttpStatus[status] ?? 'Error';

        if (typeof exceptionResponse === 'string') {
            message = exceptionResponse;
        } else if (
            exceptionResponse &&
            typeof exceptionResponse === 'object'
        ) {
            message =
                'message' in exceptionResponse
                    ? (exceptionResponse as any).message
                    : message;
            error =
                'error' in exceptionResponse
                    ? (exceptionResponse as any).error
                    : error;
        }

        response.status(status).json({
            statusCode: status,
            message,
            error,
        });
    }
}