import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // Using bcryptjs for compatibility
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserByRoleDto } from './dto/create-user-by-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>, 
  ) {}

  async findRoleByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(`Role "${name}" not found.`);
    }
    return role;
  }

  /**
   * Hashes the plaintext password using bcryptjs.
   * @param password The plaintext password string.
   * @returns The hashed password string.
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); 
    return bcrypt.hash(password, salt);
  }
  

  async findUserByEmailWithPassword(email: string): Promise<User | null> {

      return this.usersRepository.createQueryBuilder('user')
          .addSelect('user.password') 
          .leftJoinAndSelect('user.role', 'role') 
          .where('user.email = :email', { email })
          .getOne();
  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException(`User with email "${createUserDto.email}" already exists.`);
    }

    const role = await this.rolesRepository.findOneBy({ id: createUserDto.roleId });
    if (!role) {
      throw new NotFoundException(`Role with ID "${createUserDto.roleId}" not found.`);
    }

    const hashedPassword = await this.hashPassword(createUserDto.password);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      roleId: role.id,
    });

    return this.usersRepository.save(newUser);
  }

  async createUserByRole(dto: CreateUserByRoleDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({ email: dto.email });
    if (existingUser) {
      throw new ConflictException(`User with email "${dto.email}" already exists.`);
    }

    const role = await this.findRoleByName(dto.roleName);
    const hashedPassword = await this.hashPassword(dto.password);

    const newUser = this.usersRepository.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName ?? '',
      password: hashedPassword,
      roleId: role.id,
    });

    return this.usersRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'], 
    });
  }

  async countAll(): Promise<number> {
    return this.usersRepository.count();
  }

  async countByRoleName(name: string): Promise<number> {
    return this.usersRepository.count({
      where: { role: { name } },
      relations: ['role'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
        where: { id },
        relations: ['role']
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.roleId && user.roleId !== updateUserDto.roleId) {
        const role = await this.rolesRepository.findOneBy({ id: updateUserDto.roleId });
        if (!role) {
            throw new NotFoundException(`Role with ID "${updateUserDto.roleId}" not found.`);
        }
        user.roleId = role.id;
    }

    this.usersRepository.merge(user, updateUserDto);
    
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}