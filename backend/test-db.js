const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany();
  console.log("ALL PROJECTS:", projects);
  const openProjects = await prisma.project.findMany({ where: { status: 'OPEN' } });
  console.log("OPEN PROJECTS:", openProjects);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
