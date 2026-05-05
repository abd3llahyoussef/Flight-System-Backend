import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    validateUser: jest.fn().mockResolvedValue({ id: 1, email: 'test@test.com' }),
    login: jest.fn().mockResolvedValue({ access_token: 'token', user: {} }),
    register: jest.fn().mockResolvedValue({ access_token: 'token', user: {} }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const user = { id: 1, email: 'test@test.com' };
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(user);
    });
  });
  
  describe('register', () => {
    it('should call authService.register', async () => {
      const registerDto = { name: 'Test', email: 'test@test.com', password: 'password' };
      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
