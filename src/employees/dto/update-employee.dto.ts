import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsUUID, IsOptional } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
    @IsUUID('4', { message: 'userId must be a valid UUID for the linked User account.' })
    @IsOptional()
    userId?: string;
}