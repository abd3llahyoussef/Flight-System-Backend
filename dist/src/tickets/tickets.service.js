"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const stripe_service_1 = require("../stripe/stripe.service");
let TicketsService = class TicketsService {
    prisma;
    stripeService;
    constructor(prisma, stripeService) {
        this.prisma = prisma;
        this.stripeService = stripeService;
    }
    async createBooking(userId, flightId, seatNumber, seatClass, passport, nationality, dependants = []) {
        try {
            return await this.prisma.$transaction(async (tx) => {
                const flight = await tx.flight.findUnique({
                    where: { id: flightId },
                    include: { airplane: true },
                });
                if (!flight)
                    throw new common_1.NotFoundException('Flight not found');
                const allSeats = [seatNumber, ...dependants.map((d) => d.seatNumber)];
                for (const s of allSeats) {
                    const row = parseInt(s);
                    if (seatClass === 'FIRST' && row !== 1)
                        throw new common_1.BadRequestException(`Seat ${s} is not in First Class`);
                    if (seatClass === 'BUSINESS' && row > 2)
                        throw new common_1.BadRequestException(`Seat ${s} is not in Business Class`);
                    if (seatClass === 'PREMIUM' && row > 3)
                        throw new common_1.BadRequestException(`Seat ${s} is not in Premium Class`);
                    if (seatClass === 'ECONOMY' && row < 4)
                        throw new common_1.BadRequestException(`Seat ${s} is not in Economy Class`);
                }
                const existingTickets = await tx.ticket.findFirst({
                    where: {
                        flightId,
                        seatNumber: { in: allSeats },
                        status: { in: ['BOOKED', 'PENDING_PAYMENT'] },
                    },
                });
                if (existingTickets)
                    throw new common_1.BadRequestException('One or more seats are already taken');
                const existingDependants = await tx.dependant.findFirst({
                    where: {
                        ticket: {
                            flightId,
                            status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
                        },
                        seatNumber: { in: allSeats },
                    },
                });
                if (existingDependants)
                    throw new common_1.BadRequestException('One or more seats are already taken');
                if (passport || nationality) {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            ...(passport && { passport }),
                            ...(nationality && { nationality }),
                        },
                    });
                }
                const multiplier = seatClass === 'FIRST' ? 3.2 :
                    seatClass === 'BUSINESS' ? 2.4 :
                        seatClass === 'PREMIUM' ? 1.5 : 1;
                const unitPrice = flight.basePrice * multiplier;
                const totalPrice = unitPrice * (1 + dependants.length);
                const ticket = await tx.ticket.create({
                    data: {
                        userId,
                        flightId,
                        seatNumber,
                        seatClass: seatClass,
                        price: totalPrice,
                        status: 'PENDING_PAYMENT',
                    },
                });
                if (dependants.length > 0) {
                    await tx.dependant.createMany({
                        data: dependants.map((d) => ({
                            userId,
                            ticketId: ticket.id,
                            name: d.name,
                            email: d.email,
                            seatNumber: d.seatNumber,
                            dob: d.dob,
                            gender: d.gender,
                            nationality: d.nationality,
                            passport: d.passport,
                        })),
                    });
                }
                const paymentIntent = await this.stripeService.createPaymentIntent(totalPrice);
                return tx.ticket.update({
                    where: { id: ticket.id },
                    data: { paymentId: paymentIntent.id },
                });
            });
        }
        catch (error) {
            console.error('Booking service error:', error);
            throw error;
        }
    }
    async confirmPayment(paymentId) {
        const ticket = await this.prisma.ticket.findFirst({
            where: { paymentId },
        });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket not found');
        return this.prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: 'BOOKED' },
        });
    }
    async cancelBooking(userId, ticketId) {
        const ticket = await this.prisma.ticket.findUnique({
            where: { id: ticketId },
        });
        if (!ticket || ticket.userId !== userId) {
            throw new common_1.NotFoundException('Ticket not found or unauthorized');
        }
        if (ticket.status === 'CANCELLED') {
            throw new common_1.BadRequestException('Ticket already cancelled');
        }
        return this.prisma.ticket.update({
            where: { id: ticketId },
            data: { status: 'CANCELLED' },
        });
    }
    formatTicket(t) {
        return {
            id: t.id,
            ref: t.paymentId || `AW-${t.id + 100000}`,
            status: t.status === 'BOOKED' ? 'Upcoming' : t.status === 'PENDING_PAYMENT' ? 'Pending' : 'Past',
            airline: t.flight.airline,
            code: t.flight.flightNumber,
            from: t.flight.departureAirport.code,
            to: t.flight.arrivalAirport.code,
            date: t.flight.departureTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            depart: t.flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            arrive: t.flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            seat: t.seatNumber,
            gate: '—',
            price: t.price,
            seatClass: t.seatClass,
            dependants: t.dependants || [],
        };
    }
    async getUserTickets(userId) {
        const tickets = await this.prisma.ticket.findMany({
            where: { userId },
            include: {
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                    },
                },
                dependants: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return tickets.map((t) => this.formatTicket(t));
    }
    async lookupByReference(ref, lastName) {
        let ticket = await this.prisma.ticket.findFirst({
            where: { paymentId: ref },
            include: {
                user: true,
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                        airplane: true,
                    },
                },
                dependants: true,
            },
        });
        if (!ticket && ref.startsWith('AW-')) {
            const idFromRef = parseInt(ref.replace('AW-', '')) - 100000;
            if (!isNaN(idFromRef) && idFromRef > 0) {
                ticket = await this.prisma.ticket.findFirst({
                    where: { id: idFromRef, paymentId: null },
                    include: {
                        user: true,
                        flight: {
                            include: {
                                departureAirport: true,
                                arrivalAirport: true,
                                airplane: true,
                            },
                        },
                        dependants: true,
                    },
                });
            }
        }
        if (!ticket) {
            throw new common_1.NotFoundException('Booking not found');
        }
        const nameMatch = ticket.user.name
            .toLowerCase()
            .includes(lastName.toLowerCase());
        if (!nameMatch) {
            throw new common_1.NotFoundException('Booking not found');
        }
        return this.formatTicket(ticket);
    }
    async getReservedSeats(flightId) {
        const tickets = await this.prisma.ticket.findMany({
            where: {
                flightId,
                status: { in: ['BOOKED', 'PENDING_PAYMENT'] },
            },
            include: {
                dependants: {
                    select: { seatNumber: true },
                },
            },
        });
        const mainSeats = tickets.map((t) => t.seatNumber);
        const dependantSeats = tickets.flatMap((t) => t.dependants.map((d) => d.seatNumber));
        return [...mainSeats, ...dependantSeats];
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        stripe_service_1.StripeService])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map