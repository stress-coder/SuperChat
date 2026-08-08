import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name is required.' })
  @Length(2, 50, {
    message: 'Name must be between 2 and 50 characters long.',
  })
  name: string;

  @IsString({ message: 'Username must be a string.' })
  @IsNotEmpty({ message: 'Username is required.' })
  @Length(3, 30, {
    message: 'Username must be between 3 and 30 characters long.',
  })
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Username may only contain letters, numbers, underscores, dots, and hyphens.',
  })
  username: string;

  @IsEmail({}, { message: 'Email must be a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, {
    message: 'Password must be at least 8 characters long.',
  })
  password: string;
}
