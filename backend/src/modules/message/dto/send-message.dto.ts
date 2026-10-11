import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  ValidateIf,
} from 'class-validator';
import { ContentType } from '../../../common/enums/content-type.enum';

export class SendMessageDto {
  @ValidateIf((dto: SendMessageDto) => dto.recipientId === undefined)
  @IsUUID('4', { message: 'inboxId must be a valid UUID.' })
  @IsNotEmpty({ message: 'Either inboxId or recipientId is required.' })
  inboxId?: string;

  @ValidateIf((dto: SendMessageDto) => dto.inboxId === undefined)
  @IsUUID('4', { message: 'recipientId must be a valid UUID.' })
  @IsNotEmpty({ message: 'Either inboxId or recipientId is required.' })
  recipientId?: string;

  @IsString({ message: 'Content must be a string.' })
  @IsNotEmpty({ message: 'Content is required.' })
  @Length(1, 5000, { message: 'Content must be between 1 and 5000 characters long.' })
  content!: string;

  @IsOptional()
  @IsEnum(ContentType, { message: 'contentType must be a supported content type.' })
  contentType?: ContentType;

  @IsOptional()
  @IsUUID('4', { message: 'parentId must be a valid UUID.' })
  parentId?: string;
}
