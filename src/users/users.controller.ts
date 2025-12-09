import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Patch as HttpPatch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByRoleDto } from './dto/create-user-by-role.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('by-role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createByRole(@Body() dto: CreateUserByRoleDto) {
    return this.usersService.createUserByRole(dto);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/admin/stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminStats() {
    const totalUsers = await this.usersService.countAll();
    const employees = await this.usersService.countByRoleName('Employee');
    const managers = await this.usersService.countByRoleName('Manager');

    return { totalUsers, employees, managers };
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/active')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.usersService.setActiveStatus(id, isActive);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    console.log('DELETE /users id =', id);
    return this.usersService.remove(id);
  }
}
