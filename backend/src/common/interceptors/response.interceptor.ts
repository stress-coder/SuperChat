import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseShape<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

interface MessageDataShape {
  message: string;
  data: unknown;
}

const isMessageDataShape = (result: unknown): result is MessageDataShape =>
  typeof result === 'object' && result !== null && 'message' in result && 'data' in result;

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ResponseShape<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response?.statusCode ?? 200;

    return next.handle().pipe(
      map((result: T) => {
        if (isMessageDataShape(result)) {
          return {
            statusCode,
            message: result.message,
            data: result.data as T,
          };
        }

        return {
          statusCode,
          message: 'Success',
          data: result,
        };
      }),
    );
  }
}
