import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from './flights.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FlightsService', () => {
  let service: FlightsService;
  let prisma: PrismaService;

  const mockFlightData = {
    id: 1,
    flightNumber: 'AF123',
    airline: 'Air France',
    departureTime: new Date(),
    arrivalTime: new Date(Date.now() + 3600000),
    basePrice: 100,
    stops: 0,
    airplane: { model: 'A320' },
    departureAirport: { code: 'CDG' },
    arrivalAirport: { code: 'JFK' },
  };

  const mockPrismaService = {
    flight: {
      findMany: jest.fn().mockResolvedValue([mockFlightData]),
      findUnique: jest.fn().mockResolvedValue(mockFlightData),
      findFirst: jest.fn().mockResolvedValue(mockFlightData),
      create: jest.fn().mockResolvedValue(mockFlightData),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FlightsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should find all flights and format them', async () => {
      const flights = await service.findAll({});
      expect(flights).toHaveLength(1);
      expect(flights[0]).toHaveProperty('airline', 'Air France');
      expect(mockPrismaService.flight.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a flight', async () => {
      const dto = {
        flightNumber: 'AF123',
        airline: 'Air France',
        departureAirportId: '1',
        arrivalAirportId: '2',
        airplaneId: '3',
        departureTime: new Date().toISOString(),
        arrivalTime: new Date().toISOString(),
        basePrice: '100',
      };
      const flight = await service.create(dto);
      expect(flight).toEqual(mockFlightData);
      expect(mockPrismaService.flight.create).toHaveBeenCalled();
    });
  });
});
