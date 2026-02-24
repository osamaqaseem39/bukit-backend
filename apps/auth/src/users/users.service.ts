import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    clientId?: string | null,
    options?: { requiresPasswordChange?: boolean },
  ): Promise<User> {
    const { email, password, name, role } = createUserDto;

    try {
      console.log(`[UsersService] Creating user with email: ${email}`);
      
      // Check for existing user
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      console.log(`[UsersService] Hashing password for user: ${email}`);
      // Use fewer rounds (8 instead of default 10) for faster hashing in serverless environments
      const salt = await bcrypt.genSalt(8);
      const password_hash = await bcrypt.hash(password, salt);

      const user = this.usersRepository.create({
        name,
        email,
        password_hash,
        role: role || UserRole.USER,
        client_id: clientId || null,
        requires_password_change: options?.requiresPasswordChange ?? false,
      });

      console.log(`[UsersService] Saving user to database: ${email}`);
      const savedUser = await this.usersRepository.save(user);
      console.log(`[UsersService] User created successfully: ${email}`);

      return savedUser;
    } catch (error) {
      // Re-throw known exceptions
      if (error instanceof ConflictException) {
        throw error;
      }
      // Log and re-throw unexpected errors
      console.error(`[UsersService] User creation error for ${email}:`, error);
      throw error;
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  /**
   * List users based on requester's role:
   * - Super admin: all users
   * - Client admin: users in their domain (client_id = requester.id)
   * - Regular admin: all users
   */
  async findAll(requesterId?: string, requesterRole?: string): Promise<User[]> {
    // Super admin sees all
    if (requesterRole === 'super_admin') {
      return this.usersRepository.find();
    }
    // Client admin sees only users in their domain
    if (requesterRole === 'client' && requesterId) {
      return this.usersRepository.find({
        where: { client_id: requesterId },
      });
    }
    // Regular admin sees all
    return this.usersRepository.find();
  }

  /**
   * List users (all roles: super_admin, admin, client, user) without password_hash.
   * Use for admin GET /users response.
   */
  async findAllSafe(
    requesterId?: string,
    requesterRole?: string,
  ): Promise<Omit<User, 'password_hash'>[]> {
    const list = await this.findAll(requesterId, requesterRole);
    return list.map(({ password_hash: _, ...u }) => u);
  }

  /**
   * Admin: get a single user without the password hash.
   */
  async findOneSafe(id: string): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Admin: replace the modules array for a user.
   */
  async updateModules(
    id: string,
    modules: User['modules'] | null | undefined,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If modules is undefined, leave it unchanged.
    if (modules !== undefined) {
      user.modules = modules && modules.length > 0 ? modules : null;
    }

    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = saved;
    return safeUser;
  }

  /**
   * Admin: update a user's password.
   * When clearRequiresPasswordChange is true (default), sets requires_password_change to false.
   */
  async updatePassword(
    id: string,
    newPassword: string,
    clearRequiresPasswordChange = true,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(8);
    const password_hash = await bcrypt.hash(newPassword, salt);

    user.password_hash = password_hash;
    if (clearRequiresPasswordChange) {
      user.requires_password_change = false;
    }
    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...safeUser } = saved;
    return safeUser;
  }

  /**
   * Generate a random temporary password, update user, set requires_password_change.
   * Returns the plain temporary password (for admin to copy/send to client).
   */
  async resetPasswordToRandom(userId: string): Promise<{ email: string; temporary_password: string }> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const crypto = await import('crypto');
    const temporary_password = crypto.randomBytes(10).toString('base64').replace(/[/+=]/g, '').slice(0, 12);
    await this.updatePassword(userId, temporary_password, false);
    const updated = await this.findOne(userId);
    if (updated) {
      updated.requires_password_change = true;
      await this.usersRepository.save(updated);
    }
    return { email: user.email, temporary_password };
  }

  /**
   * Update a user's role and modules.
   * Super admin can update anyone.
   * Client admin can only update users in their domain.
   */
  async updateRoleAndModules(
    id: string,
    role?: UserRole,
    modules?: User['modules'] | null,
    requesterId?: string,
    requesterRole?: string,
  ): Promise<Omit<User, 'password_hash'>> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check permissions
    if (requesterRole === 'client' && requesterId) {
      // Client admin can only update users in their domain
      if (user.client_id !== requesterId) {
        throw new ForbiddenException('You can only update users in your domain');
      }
      // Client admin cannot create super admins or regular admins
      if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
        throw new ForbiddenException('You cannot assign admin roles');
      }
    }

    if (role !== undefined) {
      user.role = role;
    }
    if (modules !== undefined) {
      user.modules = modules && modules.length > 0 ? modules : null;
    }

    const saved = await this.usersRepository.save(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = saved;
    return safeUser;
  }

  /**
   * Check if requester can access/modify target user.
   */
  canAccessUser(
    requesterId: string,
    requesterRole: string,
    targetUserId: string,
    targetUserClientId?: string | null,
  ): boolean {
    // Super admin can access anyone
    if (requesterRole === 'super_admin') {
      return true;
    }
    // Client admin can only access users in their domain
    if (requesterRole === 'client') {
      return targetUserClientId === requesterId;
    }
    // Regular admin can access anyone
    if (requesterRole === 'admin') {
      return true;
    }
    return false;
  }

  /**
   * Update a user's client_id (internal use).
   */
  async updateUserClientId(userId: string, clientId: string | null): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.client_id = clientId;
    return this.usersRepository.save(user);
  }
}
