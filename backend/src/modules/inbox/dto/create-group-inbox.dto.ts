import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateGroupInboxDto {
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @Length(1, 100, { message: 'Name must be between 1 and 100 characters long.' })
  name!: string;

  @IsArray({ message: 'memberIds must be an array.' })
  @ArrayMinSize(1, { message: 'A group needs at least one other member.' })
  @ArrayMaxSize(255, { message: 'A group can have at most 255 members.' })
  @IsUUID('4', { each: true, message: 'Each memberId must be a valid UUID.' })
  memberIds!: string[];
}
