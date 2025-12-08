import { IsString, IsNotEmpty, IsUUID, IsNumber, IsPositive, IsDateString, IsOptional, Length, IsDecimal } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
    @IsUUID('4', { message: 'userId must be a valid UUID for the linked User account.' })
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    @Length(2, 150)
    jobTitle: string;

    @IsDateString()
    @IsNotEmpty()
    startDate: string; 

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Type(() => Number)
    salary: number; 

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @Length(10, 20)
    phone?: string;
}