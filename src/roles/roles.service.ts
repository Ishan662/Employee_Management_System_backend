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
    const role = await this.findOne(roleId);

    if(!permissionNames ||permissionNames.length === 0){
      role.permissions = [];
      return this.rolesRepository.save(role);
    }

    const permissions = await this.permissionsRepository.find({
      where: {name: In(permissionNames)},
    });
    role.permissions = permissions;
    const savedRole = await this.rolesRepository.save(role);

    return savedRole;
  }
}
