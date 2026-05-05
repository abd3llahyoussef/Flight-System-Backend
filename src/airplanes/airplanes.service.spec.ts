import { Test, TestingModule } from '@nestjs/testing';
import { AirplanesService } from './airplanes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AirplanesService', () => {
  let service: AirplanesService;

  const mockPrismaService = {
    airplane: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirplanesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AirplanesService>(AirplanesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
