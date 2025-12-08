import { IsString, IsEmail, IsUUID, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail({}, { message: 'Must be a valid email address.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUUID('4', { message: 'roleId must be a valid UUID.' })
  @IsOptional()
  roleId?: string;
}