"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    const users = await prisma.user.findMany({
        select: { id: true, email: true, isOnline: true, lastSeen: true }
    });
    console.log('Users:', users);
    await prisma.$disconnect();
}
main().catch(e => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=check.js.map