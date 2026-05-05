import { Test, TestingModule } from '@nestjs/testing';
import { AirportsService } from './airports.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AirportsService', () => {
  let service: AirportsService;

  const mockPrismaService = {
    airport: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 1 }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AirportsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AirportsService>(AirportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
