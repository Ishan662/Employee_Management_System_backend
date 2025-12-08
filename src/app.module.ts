import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { Permission } from './roles/entities/permission.entity';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: 'localhost', 
      port: 5432,
      username: 'postgres',
      password: 'Ishn@2002', 
      database: 'ems_db',
      entities: [User, Role, Permission],
      synchronize: true, 
      logging: true,
    }),
    RolesModule,
    UsersModule,
    AuthModule,
    EmployeesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
