// src/roles/dto/create-role.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsArray, ArrayUnique, ArrayNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string; 

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayUnique() 
  @IsOptional()
  permissionNames?: string[]; 
}