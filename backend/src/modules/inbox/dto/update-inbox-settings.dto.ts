import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { InboxUserStatus } from '../../../common/enums/inbox-user-status.enum';

export class InboxUserPropertiesDto {
  @IsOptional()
  @IsString({ message: 'theme must be a string.' })
  @Length(1, 50, { message: 'theme must be between 1 and 50 characters long.' })
  theme?: string;

  @IsOptional()
  @IsString({ message: 'notification must be a string.' })
  @Length(1, 50, { message: 'notification must be between 1 and 50 characters long.' })
  notification?: string;
}

export class UpdateInboxSettingsDto {
  @IsOptional()
  @IsString({ message: 'Nickname must be a string.' })
  @Length(1, 50, { message: 'Nickname must be between 1 and 50 characters long.' })
  nickname?: string;

  @IsOptional()
  @IsEnum(InboxUserStatus, { message: 'Status must be a valid inbox user status.' })
  status?: InboxUserStatus;

  @IsOptional()
  @ValidateNested({ message: 'properties must be a valid object.' })
  @Type(() => InboxUserPropertiesDto)
  properties?: InboxUserPropertiesDto;
}
