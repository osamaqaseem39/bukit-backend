import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ClientStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  ACTIVE = 'active',
}

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  company_registration_number: string;

  @Column({ nullable: true })
  tax_id: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.PENDING,
  })
  status: ClientStatus;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  cover_image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };

  @Column({ type: 'jsonb', nullable: true })
  payment_details: {
    bank_name?: string;
    account_number?: string;
    account_holder_name?: string;
    routing_number?: string;
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_rate: number; // Platform commission percentage

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
