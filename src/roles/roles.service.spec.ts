// src/roles/roles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  private async resolvePermissions(permissionNames?: string[]): Promise<Permission[]> {
    if (!permissionNames || permissionNames.length === 0) {
      return [];
    }
    const permissions = await Promise.all(
      permissionNames.map(name => this.permissionsRepository.findOneBy({ name }))
    );

    const notFound = permissionNames.filter((name, index) => !permissions[index]);
    if (notFound.length > 0) {
      throw new NotFoundException(`Permissions not found: ${notFound.join(', ')}`);
    }
    return permissions.filter((p): p is Permission => p !== null);
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const permissions = await this.resolvePermissions(dto.permissionNames);
    
    const newRole = this.rolesRepository.create({
      name: dto.name,
      description: dto.description,
      permissions: permissions, 
    });
    return this.rolesRepository.save(newRole);
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find(); 
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    if (dto.permissionNames) {
      role.permissions = await this.resolvePermissions(dto.permissionNames);
    }
    
    // Apply remaining updates
    role.name = dto.name ?? role.name;
    role.description = dto.description ?? role.description;

    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
  }
}