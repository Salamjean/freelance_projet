"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const prisma_service_1 = require("./prisma/prisma.service");
async function test() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const prisma = app.get(prisma_service_1.PrismaService);
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
//# sourceMappingURL=test.js.map