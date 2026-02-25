import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from './users/users.service';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      registerClient: jest.fn(),
      refreshTokens: jest.fn(),
      changePassword: jest.fn(),
      logout: jest.fn(),
    } as any;

    const mockUsersService = {
      findOne: jest.fn(),
    } as any;

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    authService = app.get<AuthService>(AuthService);
    usersService = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('register', () => {
    it('should delegate to authService.register', async () => {
      const dto: any = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };
      const expectedResult = { id: '1', ...dto };

      (authService.register as jest.Mock).mockResolvedValue(expectedResult);

      await expect(authController.register(dto)).resolves.toEqual(
        expectedResult,
      );
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('registerClient', () => {
    it('should delegate to authService.registerClient', async () => {
      const dto: any = {
        user: {
          name: 'Client Admin',
          email: 'client@example.com',
          password: 'password',
        },
        client: {
          company_name: 'Test Company',
        },
      };
      const expectedResult = {
        user: { id: '1', email: dto.user.email, name: dto.user.name },
        client: { id: 'client-1', company_name: dto.client.company_name },
        temporary_password: 'tempPass123',
      };

      (authService.registerClient as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      await expect(authController.registerClient(dto)).resolves.toEqual(
        expectedResult,
      );
      expect(authService.registerClient).toHaveBeenCalledWith(dto);
    });
  });

  describe('getProfile', () => {
    it('should return user without password_hash', async () => {
      const userId = 'user-1';
      const dbUser: any = {
        id: userId,
        email: 'profile@example.com',
        name: 'Profile User',
        password_hash: 'hashed',
      };

      (usersService.findOne as jest.Mock).mockResolvedValue(dbUser);

      const req: any = {
        user: {
          userId,
        },
      };

      const result = await authController.getProfile(req);

      expect(result).toEqual({
        id: userId,
        email: 'profile@example.com',
        name: 'Profile User',
      });
      expect(usersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
});