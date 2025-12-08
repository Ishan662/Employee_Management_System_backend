import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BaseEntity } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('employees')
export class Employee extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @Column({ length: 150 })
  jobTitle: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) 
  salary: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  

  @OneToOne(() => User, { onDelete: 'CASCADE' }) 
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ unique: true }) 
  userId: string;
}