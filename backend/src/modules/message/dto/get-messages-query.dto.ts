import { Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

export class GetMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer.' })
  @Min(1, { message: 'limit must be at least 1.' })
  @Max(100, { message: 'limit must not exceed 100.' })
  limit?: number;

  @IsOptional()
  @IsISO8601({}, { message: 'before must be a valid ISO 8601 date.' })
  before?: string;
}
