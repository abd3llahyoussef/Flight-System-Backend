const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const flight = await prisma.flight.create({
      data: {
        flightNumber: 'TST999',
        airline: 'TestAir',
        departureAirportId: 4,
        arrivalAirportId: 5,
        airplaneId: 3,
        departureTime: new Date('2026-05-15T12:00'),
        arrivalTime: new Date('2026-05-15T14:00'),
        basePrice: 499.00,
        stops: 0,
      }
    });
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
