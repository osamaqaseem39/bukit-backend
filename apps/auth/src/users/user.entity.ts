import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  USER = 'user',
}

/**
 * Dashboard modules that can be enabled per user.
 *
 * This is intentionally kept as a string union so the frontend can
 * use the same keys to control which dashboard sections and sidebar
 * items are visible for a given user.
 */
export type UserDashboardModule =
  | 'dashboard-overview'
  | 'gaming'
  | 'snooker'
  | 'table-tennis'
  | 'cricket'
  | 'futsal-turf'
  | 'padel'
  | 'locations'
  | 'users'
  | 'bookings'
  | 'analytics'
  | 'settings';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /**
   * Optional list of dashboard modules that this user is allowed to see.
   *
   * - When null, the frontend will fall back to role-based visibility.
   * - When set, the dashboard & sidebar will only show modules contained here.
   *
   * Stored as a simple comma-separated string in the database for simplicity.
   */
  @Column('simple-array', { nullable: true })
  modules?: UserDashboardModule[] | null;

  @Column()
  password_hash: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
