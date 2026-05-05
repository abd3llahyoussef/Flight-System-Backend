import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.ticket.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airplane.deleteMany();
  await prisma.airport.deleteMany();
  await prisma.user.deleteMany();

  // Create Airports
  const jfk = await prisma.airport.create({
    data: { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
  });
  const lhr = await prisma.airport.create({
    data: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
  });
  const cdg = await prisma.airport.create({
    data: { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  });
  const lax = await prisma.airport.create({
    data: { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
  });
  const nrt = await prisma.airport.create({
    data: { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  });
  const bcn = await prisma.airport.create({
    data: { code: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
  });

  // Create Airplanes
  const b737 = await prisma.airplane.create({
    data: { model: 'Boeing 737', totalSeats: 160, economySeats: 140, businessSeats: 20 },
  });
  const a320 = await prisma.airplane.create({
    data: { model: 'Airbus A320', totalSeats: 150, economySeats: 130, businessSeats: 20 },
  });
  const b777 = await prisma.airplane.create({
    data: { model: 'Boeing 777', totalSeats: 300, economySeats: 260, businessSeats: 40 },
  });

  // Create Flights
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const flightsData = [
    {
      flightNumber: 'AA100',
      airline: 'Aurora Air',
      departureAirportId: jfk.id,
      arrivalAirportId: lhr.id,
      airplaneId: b777.id,
      departureTime: tomorrow,
      arrivalTime: new Date(tomorrow.getTime() + 7 * 60 * 60 * 1000),
      basePrice: 550,
      stops: 0,
    },
    {
      flightNumber: 'MD188',
      airline: 'Meridian',
      departureAirportId: lax.id,
      arrivalAirportId: nrt.id,
      airplaneId: b777.id,
      departureTime: dayAfter,
      arrivalTime: new Date(dayAfter.getTime() + 11 * 60 * 60 * 1000),
      basePrice: 850,
      stops: 0,
    },
    {
      flightNumber: 'SK902',
      airline: 'Skyline',
      departureAirportId: bcn.id,
      arrivalAirportId: jfk.id,
      airplaneId: a320.id,
      departureTime: nextWeek,
      arrivalTime: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000),
      basePrice: 420,
      stops: 1,
    },
    {
      flightNumber: 'AU412',
      airline: 'Aurora Air',
      departureAirportId: jfk.id,
      arrivalAirportId: lax.id,
      airplaneId: b737.id,
      departureTime: new Date(now.getTime() + 30 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 36 * 60 * 60 * 1000),
      basePrice: 320,
      stops: 0,
    },
    {
      flightNumber: 'AF200',
      airline: 'Skyline',
      departureAirportId: lhr.id,
      arrivalAirportId: cdg.id,
      airplaneId: a320.id,
      departureTime: nextWeek,
      arrivalTime: new Date(nextWeek.getTime() + 1.5 * 60 * 60 * 1000),
      basePrice: 150,
      stops: 0,
    },
    {
      flightNumber: 'QR300',
      airline: 'Meridian',
      departureAirportId: lax.id,
      arrivalAirportId: cdg.id,
      airplaneId: b777.id,
      departureTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
      arrivalTime: new Date(now.getTime() + 59 * 60 * 60 * 1000),
      basePrice: 920,
      stops: 1,
    },
  ];

  for (const flight of flightsData) {
    await prisma.flight.create({ data: flight });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
