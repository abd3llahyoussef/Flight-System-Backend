import { Test, TestingModule } from '@nestjs/testing';
import { AirplanesController } from './airplanes.controller';
import { AirplanesService } from './airplanes.service';

describe('AirplanesController', () => {
  let controller: AirplanesController;

  const mockAirplanesService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 1 }),
    create: jest.fn().mockResolvedValue({ id: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirplanesController],
      providers: [
        {
          provide: AirplanesService,
          useValue: mockAirplanesService,
        },
      ],
    }).compile();

    controller = module.get<AirplanesController>(AirplanesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
