import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { UsersService } from '../users/users.service'; 

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    private usersService: UsersService, 
  ) {}

  /**
   * Helper function to check if a User ID is valid and not already assigned.
   * @param userId The User ID to validate.
   * @param currentEmployeeId Optional ID of the employee being updated (for self-exclusion).
   */
  private async validateUserId(userId: string, currentEmployeeId?: string): Promise<void> {
    try {
      await this.usersService.findOne(userId); 
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`User with ID "${userId}" not found. Cannot link employee.`);
      }
      throw error;
    }

    const existingEmployee = await this.employeesRepository.findOneBy({ userId });

    if (existingEmployee && existingEmployee.id !== currentEmployeeId) {
      throw new ConflictException(`User with ID "${userId}" is already linked to an employee.`);
    }
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    await this.validateUserId(createEmployeeDto.userId);

    const newEmployee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(newEmployee);
  }

  findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({
        relations: ['user', 'user.role']
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ['user', 'user.role'], 
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id); 

    if (updateEmployeeDto.userId && updateEmployeeDto.userId !== employee.userId) {
        await this.validateUserId(updateEmployeeDto.userId, id);
    }
    
    this.employeesRepository.merge(employee, updateEmployeeDto);
    
    return this.employeesRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const result = await this.employeesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    
  }
}