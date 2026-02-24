import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
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
   * Optional FK to parent user (client admin). Normalized self-join: one users table.
   * - For client admins: typically their own id (self) or null
   * - For users in a client domain: the client admin's user id
   * - For super admins and regular admins: null
   */
  @Column({ name: 'client_id', nullable: true })
  client_id?: string | null;

  /** Parent user (client admin) this user belongs to. Self-join on users table. */
  @ManyToOne(() => User, (u) => u.child_users, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'client_id' })
  parent?: User | null;

  /** Users that belong to this user's domain (when this user is a client admin). */
  @OneToMany(() => User, (u) => u.parent)
  child_users?: User[];

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

  /**
   * When true, user must change password on next login (e.g. after admin-created default).
   */
  @Column({ default: false })
  requires_password_change: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
