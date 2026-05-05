import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({ id: 'pi_123', client_secret: 'secret' }),
      },
      webhooks: {
        constructEvent: jest.fn().mockReturnValue({ id: 'evt_123' }),
      },
    };
  });
});

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should call stripe.paymentIntents.create', async () => {
      const result = await service.createPaymentIntent(100);
      expect(result.id).toBe('pi_123');
    });
  });
});
