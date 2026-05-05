import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;
  let stripe: StripeService;

  const mockTicket = {
    id: 1,
    userId: 1,
    flightId: 1,
    seatNumber: '1A',
    seatClass: 'FIRST',
    price: 320,
    status: 'BOOKED',
    paymentId: 'pi_123',
    flight: {
      airline: 'Aerway',
      flightNumber: 'AW101',
      departureAirport: { code: 'LHR' },
      arrivalAirport: { code: 'DXB' },
      departureTime: new Date(),
      arrivalTime: new Date(),
    },
    dependants: [],
  };

  const mockPrismaService = {
    ticket: {
      findMany: jest.fn().mockResolvedValue([mockTicket]),
      findUnique: jest.fn().mockResolvedValue(mockTicket),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(mockTicket),
      update: jest.fn().mockResolvedValue(mockTicket),
    },
    flight: {
      findUnique: jest.fn().mockResolvedValue({ id: 1, basePrice: 100, airplane: { model: '737' } }),
    },
    user: {
      update: jest.fn(),
    },
    dependant: {
      createMany: jest.fn(),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrismaService)),
  };

  const mockStripeService = {
    createPaymentIntent: jest.fn().mockResolvedValue({ id: 'pi_123' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
    stripe = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserTickets', () => {
    it('should return formatted tickets', async () => {
      const tickets = await service.getUserTickets(1);
      expect(tickets).toHaveLength(1);
      expect(tickets[0].ref).toBe('pi_123');
      expect(prisma.ticket.findMany).toHaveBeenCalled();
    });
  });

  describe('createBooking', () => {
    it('should create a booking with payment intent', async () => {
      const result = await service.createBooking(1, 1, '1A', 'FIRST');
      expect(result).toEqual(mockTicket);
      expect(stripe.createPaymentIntent).toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    it('should update status to CANCELLED', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValueOnce(mockTicket);
      await service.cancelBooking(1, 1);
      expect(prisma.ticket.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'CANCELLED' },
      });
    });

    it('should throw NotFoundException if ticket not found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValueOnce(null);
      await expect(service.cancelBooking(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
