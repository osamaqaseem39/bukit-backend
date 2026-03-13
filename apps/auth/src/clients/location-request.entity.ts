import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { Location } from './location.entity';

export enum LocationRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('location_requests')
export class LocationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ type: 'uuid', nullable: true })
  approved_location_id: string | null;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'approved_location_id' })
  approved_location: Location | null;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  postal_code?: string;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 12, scale: 8, nullable: true })
  longitude?: number;

  @Column({
    type: 'enum',
    enum: LocationRequestStatus,
    default: LocationRequestStatus.PENDING,
  })
  status: LocationRequestStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

