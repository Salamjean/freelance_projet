
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);
  const freelancers = await prisma.user.findMany({
      where: { 
        role: 'FREELANCER',
        subscription: {
          status: 'ACTIVE'
        }
      },
      include: {
        profile: {
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      }
    });
  console.log(JSON.stringify(freelancers, null, 2));
  await app.close();
}
test();

