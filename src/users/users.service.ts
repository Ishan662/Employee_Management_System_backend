import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs'; // Using bcryptjs for compatibility
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>, 
  ) {}

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

    // 4. Create User Entity
    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, // Store the hash
      roleId: role.id, // Ensure we use the validated Role ID
    });

    // 5. Save and return (TypeORM will automatically exclude the password field from the return object)
    return this.usersRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['role'], // Automatically join and load the related Role object
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

    // If roleId is being updated, validate the new role
    if (updateUserDto.roleId && user.roleId !== updateUserDto.roleId) {
        const role = await this.rolesRepository.findOneBy({ id: updateUserDto.roleId });
        if (!role) {
            throw new NotFoundException(`Role with ID "${updateUserDto.roleId}" not found.`);
        }
        user.roleId = role.id;
    }

    // Apply remaining updates (firstName, lastName, email, isActive, etc.)
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