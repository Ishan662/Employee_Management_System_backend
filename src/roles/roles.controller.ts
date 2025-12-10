import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('/permissions/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id/permissions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  getRolePermissions(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id/permissions')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateRolePermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds?: string[]; permissions?: string[] },
  ) {
    console.log('=== PATCH /roles/:id/permissions ===');
    console.log('Role ID:', id);
    console.log('Full body:', JSON.stringify(body, null, 2));
    
    // Accept both permissionIds (from frontend) and permissions (legacy)
    const permissionNames = body.permissionIds || body.permissions || [];
    console.log('Permission names to assign:', permissionNames);
    
    return this.rolesService.updateRolePermissions(id, permissionNames);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
