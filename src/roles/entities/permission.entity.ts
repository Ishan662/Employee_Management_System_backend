// src/roles/entities/permission.entity.ts
import { Entity, PrimaryColumn, Column, ManyToMany } from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryColumn({ length: 50 }) 
  name: string; 

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}