import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Location } from '../clients/location.entity';
import { Facility } from '../clients/facility.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('bookings')
@Index('idx_bookings_facility_time', ['facility_id', 'start_time', 'end_time'])
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  location_id: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'uuid', nullable: true })
  facility_id: string | null;

  @ManyToOne(() => Facility, { nullable: true })
  @JoinColumn({ name: 'facility_id' })
  facility: Facility | null;

  @Column({ type: 'timestamptz' })
  start_time: Date;

  @Column({ type: 'timestamptz' })
  end_time: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ type: 'boolean', default: false })
  is_walk_in: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  guest_name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  guest_phone: string | null;

  @Column({ type: 'numeric', nullable: true })
  amount: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  checked_in_at: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  check_in_status: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

