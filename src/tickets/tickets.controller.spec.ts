import { Test, TestingModule } from '@nestjs/testing';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockTicketsService = {
    getUserTickets: jest.fn().mockResolvedValue([]),
    createBooking: jest.fn().mockResolvedValue({}),
    cancelBooking: jest.fn().mockResolvedValue({}),
    lookupByReference: jest.fn().mockResolvedValue({}),
    getReservedSeats: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMyTickets', () => {
    it('should call service.getUserTickets', async () => {
      const req = { user: { id: 1 } } as any;
      await controller.getMyTickets(req);
      expect(service.getUserTickets).toHaveBeenCalledWith(1);
    });
  });

  describe('book', () => {
    it('should call service.createBooking', async () => {
      const req = { user: { id: 1 } } as any;
      const dto = { flightId: 1, seatNumber: '1A', seatClass: 'FIRST' };
      await controller.book(req, dto);
      expect(service.createBooking).toHaveBeenCalled();
    });
  });
});
