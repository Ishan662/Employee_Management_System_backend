import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    this.rolesRepository.merge(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
  }

  async findAllPermissions(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { name: 'ASC' },
    });
  }

  async updateRolePermissions(roleId: string, permissionNames: string[]): Promise<Role> {
    console.log('Updating role permissions:', { roleId, permissionNames });
    
    const role = await this.findOne(roleId);
    console.log('Found role:', role.name, 'Current permissions:', role.permissions.map(p => p.name));
    
    if (!permissionNames || permissionNames.length === 0) {
      // Clear all permissions if empty array
      console.log('Clearing all permissions');
      role.permissions = [];
      return this.rolesRepository.save(role);
    }
    
    // Find all permissions by their names
    const permissions = await this.permissionsRepository.find({
      where: { name: In(permissionNames) },
    });
    
    console.log('Found permissions to assign:', permissions.map(p => p.name));

    // Update the role's permissions
    role.permissions = permissions;
    const savedRole = await this.rolesRepository.save(role);
    console.log('Saved role with permissions:', savedRole.permissions.map(p => p.name));
    
    return savedRole;
  }
}
