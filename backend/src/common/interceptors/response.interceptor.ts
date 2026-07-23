import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseShape<T = unknown> {
    statusCode: number;
    message: string;
    data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseShape<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>,): Observable<ResponseShape<T>> {
        const response = context.switchToHttp().getResponse();
        const statusCode = response?.statusCode ?? 200;

        return next.handle().pipe(
            map((result: any) => {
                if (
                    result &&
                    typeof result === 'object' &&
                    'message' in result &&
                    'data' in result
                ) {
                    return {
                        statusCode,
                        message: result.message,
                        data: result.data,
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