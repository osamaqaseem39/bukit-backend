import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/src/users/user.entity';
import { Location } from '../../auth/src/clients/location.entity';

export enum GamingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('gaming_centers')
export class GamingCenter {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'client_id' })
  client: User;

  @Column({ type: 'uuid', nullable: true })
  location_id: string | null;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location: Location | null;

  @Column({ type: 'uuid' })
  admin_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'admin_id' })
  admin: User;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: GamingStatus,
    default: GamingStatus.ACTIVE,
  })
  status: GamingStatus;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  cover_image_url: string;

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @Column({ type: 'jsonb', nullable: true })
  business_hours: {
    [key: string]: {
      open: string;
      close: string;
      is_closed: boolean;
    };
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourly_rate: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
