const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.airplane.findMany().then(a => console.log(a)).finally(() => prisma.$disconnect());
