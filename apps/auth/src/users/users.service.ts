import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
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
        role,
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
   * Admin: list all users.
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
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
}
