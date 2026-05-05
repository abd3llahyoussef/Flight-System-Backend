export declare class StripeService {
    private stripe;
    constructor();
    createPaymentIntent(amount: number, currency?: string): Promise<import("node_modules/stripe/cjs/lib").Response<import("node_modules/stripe/cjs/resources/PaymentIntents").PaymentIntent>>;
    constructEvent(payload: Buffer, sig: string): Promise<import("node_modules/stripe/cjs/resources/Events").Event>;
}
