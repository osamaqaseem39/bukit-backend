import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Location } from './location.entity';

export enum FacilityType {
  GAMING_PC = 'gaming-pc',
  VR = 'vr',
  PS4 = 'ps4',
  PS5 = 'ps5',
  XBOX = 'xbox',
  SNOOKER_TABLE = 'snooker-table',
  TABLE_TENNIS_TABLE = 'table-tennis-table',
  FUTSAL_FIELD = 'futsal-field',
  CRICKET_PITCH = 'cricket-pitch',
  PADEL_COURT = 'padel-court',
  OTHER = 'other',
}

export enum FacilityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('facilities')
export class Facility {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  location_id: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: FacilityType,
    default: FacilityType.OTHER,
  })
  type: FacilityType;

  @Column({
    type: 'enum',
    enum: FacilityStatus,
    default: FacilityStatus.ACTIVE,
  })
  status: FacilityStatus;

  @Column({ type: 'int', nullable: true })
  capacity: number | null;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

