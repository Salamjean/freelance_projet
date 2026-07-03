const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(u => {
  console.log(u.map(x => ({id: x.id, isOnline: x.isOnline})));
}).finally(() => prisma.$disconnect());
