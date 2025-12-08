import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Role as RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService, 
  ) {}


  async validateUser(email: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findUserByEmailWithPassword(email);

    if (user && user.isActive && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result as User;
    }
    return null;
  }


  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or user is inactive');
    }

    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role.name 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(signupDto: SignupDto) {
    const employeeRole = await this.usersService.findRoleByName(RoleEnum.EMPLOYEE);

    const user = await this.usersService.create({
      email: signupDto.email,
      firstName: signupDto.firstName,
      lastName: signupDto.lastName ?? '',
      password: signupDto.password,
      roleId: employeeRole.id,
    });

    const payload = {
      email: user.email,
      sub: user.id,
      role: employeeRole.name,
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: employeeRole.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}