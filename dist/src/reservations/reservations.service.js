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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReservationsService = class ReservationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        const reference = `AW-${Math.floor(Math.random() * 900000) + 100000}`;
        return this.prisma.reservation.create({
            data: {
                reference,
                userId,
                flightId: Number(data.flightId),
                seatClass: data.seatClass || 'ECONOMY',
                totalPrice: Number(data.totalPrice),
                status: 'HELD',
                leadFirstName: data.leadFirstName,
                leadLastName: data.leadLastName,
                leadEmail: data.leadEmail,
                leadPhone: data.leadPhone,
                passengers: data.passengers || [],
            },
            include: {
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                    }
                }
            }
        });
    }
    async getByUser(userId) {
        const reservations = await this.prisma.reservation.findMany({
            where: { userId },
            include: {
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        return reservations.map((r) => this.formatReservation(r));
    }
    async lookup(ref, lastName) {
        const reservation = await this.prisma.reservation.findFirst({
            where: {
                reference: ref,
                leadLastName: {
                    equals: lastName,
                    mode: 'insensitive',
                },
            },
            include: {
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true,
                    }
                }
            },
        });
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        return this.formatReservation(reservation);
    }
    formatReservation(r) {
        return {
            id: r.id,
            ref: r.reference,
            status: 'Pending',
            airline: r.flight.airline,
            code: r.flight.flightNumber,
            from: r.flight.departureAirport.code,
            to: r.flight.arrivalAirport.code,
            date: r.flight.departureTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            depart: r.flight.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            arrive: r.flight.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            seat: 'Held',
            gate: '—',
            price: r.totalPrice,
            seatClass: r.seatClass,
            dependants: r.passengers || [],
            isReservation: true,
        };
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReservationsService);
//# sourceMappingURL=reservations.service.js.map