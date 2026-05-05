const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.ticket.findMany({ include: { user: true } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
