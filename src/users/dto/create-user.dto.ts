import { IsString, IsNotEmpty, IsEmail, MinLength, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Must be a valid email address.' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID.' })
  @IsNotEmpty()
  roleId: string;
}
