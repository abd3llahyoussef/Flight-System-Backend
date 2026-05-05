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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const bookingsToday = await this.prisma.ticket.count({
            where: {
                createdAt: { gte: today, lt: tomorrow },
                status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
            }
        });
        const revenueAggr = await this.prisma.ticket.aggregate({
            _sum: { price: true },
            where: {
                createdAt: { gte: today, lt: tomorrow },
                status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
            }
        });
        const revenue24h = revenueAggr._sum.price || 0;
        const activeTravelersAggr = await this.prisma.ticket.groupBy({
            by: ['userId'],
            where: {
                status: { in: ['BOOKED', 'PENDING_PAYMENT'] }
            }
        });
        const activeTravelers = activeTravelersAggr.length;
        const cancellations = await this.prisma.ticket.count({
            where: {
                createdAt: { gte: today, lt: tomorrow },
                status: 'CANCELLED'
            }
        });
        const flightsRaw = await this.prisma.flight.findMany({
            where: {
                departureTime: {
                    gte: today,
                    lt: tomorrow
                }
            },
            include: {
                departureAirport: true,
                arrivalAirport: true,
                airplane: true,
                tickets: {
                    where: { status: { in: ['BOOKED', 'PENDING_PAYMENT'] } }
                }
            },
            take: 10,
            orderBy: { departureTime: 'asc' }
        });
        const flightStatusMap = {
            SCHEDULED: 'Scheduled',
            DELAYED: 'Delayed',
            DEPARTED: 'On time',
            ARRIVED: 'Arrived',
            CANCELLED: 'Cancelled'
        };
        const flights = flightsRaw.map(f => {
            const load = f.airplane && f.airplane.totalSeats > 0
                ? Math.round((f.tickets.length / f.airplane.totalSeats) * 100)
                : 0;
            return {
                code: f.flightNumber,
                route: `${f.departureAirport.code} → ${f.arrivalAirport.code}`,
                dep: f.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                status: flightStatusMap[f.status] || 'Scheduled',
                load: load
            };
        });
        const recentTickets = await this.prisma.ticket.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                user: true,
                flight: {
                    include: {
                        departureAirport: true,
                        arrivalAirport: true
                    }
                }
            }
        });
        const bookings = recentTickets.map(t => {
            const ref = t.paymentId || `AW-${t.id + 100000}`;
            return {
                ref,
                name: t.user.name,
                route: `${t.flight.departureAirport.code} → ${t.flight.arrivalAirport.code}`,
                amount: t.price,
                status: t.status === 'BOOKED' || t.status === 'PENDING_PAYMENT' ? 'Confirmed' : (t.status === 'CANCELLED' ? 'Refunded' : 'Pending')
            };
        });
        return {
            kpis: {
                bookingsToday,
                revenue24h,
                activeTravelers,
                cancellations
            },
            flights,
            bookings
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map