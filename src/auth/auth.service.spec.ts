import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    name: 'Test User',
  };

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mockToken'),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password if valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: 'Test User' });
    });

    it('should return null if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      const result = await service.validateUser('notfound@example.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const result = await service.login(mockUser);
      expect(result).toEqual({
        access_token: 'mockToken',
        user: mockUser,
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should create user and return login result', async () => {
      mockUsersService.findOne.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register({ name: 'Test', email: 'test@example.com', password: 'password' });
      expect(result).toEqual({
        message: 'Registration successful. You can now log in.',
        email: mockUser.email,
      });
      expect(usersService.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      await expect(service.register({ email: 'test@example.com', password: 'password' }))
        .rejects.toThrow(ConflictException);
    });
  });
});
