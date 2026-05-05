import { Test, TestingModule } from '@nestjs/testing';
import { AirportsController } from './airports.controller';
import { AirportsService } from './airports.service';

describe('AirportsController', () => {
  let controller: AirportsController;

  const mockAirportsService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirportsController],
      providers: [
        {
          provide: AirportsService,
          useValue: mockAirportsService,
        },
      ],
    }).compile();

    controller = module.get<AirportsController>(AirportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
