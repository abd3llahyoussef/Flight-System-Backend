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
exports.FlightsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FlightsService = class FlightsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatFlight(f) {
        const durationMs = f.arrivalTime.getTime() - f.departureTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        return {
            id: f.id.toString(),
            airline: f.airline,
            code: f.flightNumber,
            depart: f.departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            arrive: f.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
            departDate: f.departureTime.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
            arriveDate: f.arrivalTime.toLocaleDateString([], { month: 'numeric', day: 'numeric' }),
            duration: `${hours}h ${minutes}m`,
            stops: f.stops,
            price: f.basePrice,
            aircraft: f.airplane.model,
            from: f.departureAirport.code,
            to: f.arrivalAirport.code,
        };
    }
    async findAll(query) {
        const { from, to, date } = query;
        const where = {};
        if (from) {
            where.departureAirport = { code: from };
        }
        if (to) {
            where.arrivalAirport = { code: to };
        }
        if (date) {
            const searchDate = new Date(date);
            where.departureTime = {
                gte: new Date(searchDate.setHours(0, 0, 0, 0)),
            };
        }
        const flights = await this.prisma.flight.findMany({
            where,
            include: {
                departureAirport: true,
                arrivalAirport: true,
                airplane: true,
            },
        });
        return flights.map((f) => this.formatFlight(f));
    }
    async findMany(id) {
        return this.prisma.flight.findFirst({
            where: { id },
            include: {
                departureAirport: true,
                arrivalAirport: true,
                airplane: true,
                tickets: {
                    where: { status: { in: ['BOOKED', 'PENDING_PAYMENT'] } },
                },
            },
        });
    }
    async create(data) {
        try {
            const flight = await this.prisma.flight.create({
                data: {
                    flightNumber: data.flightNumber,
                    airline: data.airline,
                    departureAirportId: parseInt(data.departureAirportId),
                    arrivalAirportId: parseInt(data.arrivalAirportId),
                    airplaneId: parseInt(data.airplaneId),
                    departureTime: new Date(data.departureTime),
                    arrivalTime: new Date(data.arrivalTime),
                    basePrice: parseFloat(data.basePrice),
                    stops: data.stops ? parseInt(data.stops) : 0,
                }
            });
            return flight;
        }
        catch (e) {
            console.error("Create flight error:", e);
            throw e;
        }
    }
};
exports.FlightsService = FlightsService;
exports.FlightsService = FlightsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlightsService);
//# sourceMappingURL=flights.service.js.map