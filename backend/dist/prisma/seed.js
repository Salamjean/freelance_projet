"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const bcrypt = __importStar(require("bcrypt"));
require("dotenv/config");
const urlString = process.env['DATABASE_URL'] || 'mysql://root@localhost:3306/freelance_db';
let host = 'localhost';
let port = 3306;
let user = 'root';
let password = '';
let database = 'freelance_db';
try {
    const parsedUrl = new URL(urlString);
    host = parsedUrl.hostname || host;
    port = parsedUrl.port ? parseInt(parsedUrl.port, 10) : port;
    user = parsedUrl.username || user;
    password = parsedUrl.password ? decodeURIComponent(parsedUrl.password) : password;
    database = parsedUrl.pathname ? parsedUrl.pathname.replace(/^\//, '') : database;
}
catch (e) {
    console.error('Erreur lors du parsing de DATABASE_URL pour le seeding.', e);
}
const adapter = new adapter_mariadb_1.PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 2,
});
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log('🌱 Démarrage du peuplement (seeding) de la base de données...');
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'azertyui';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (!existingAdmin) {
        await prisma.$transaction(async (tx) => {
            const newAdmin = await tx.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'ADMIN',
                    isEmailVerified: true,
                },
            });
            await tx.profile.create({
                data: {
                    userId: newAdmin.id,
                    firstName: 'Admin',
                    lastName: 'Freelink',
                    bio: 'Compte administrateur général de la plateforme Freelink.',
                },
            });
            await tx.wallet.create({
                data: {
                    userId: newAdmin.id,
                    balance: 0.00,
                },
            });
            console.log(`✅ Administrateur créé avec succès ! (Email : ${adminEmail})`);
        });
    }
    else {
        console.log(`ℹ️ L'administrateur existe déjà.`);
    }
    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
        console.log('🌱 Ajout des catégories de projets...');
        const catDev = await prisma.category.create({
            data: {
                name: 'Développement Web',
                slug: 'dev-web-logiciel',
            },
        });
        await prisma.subCategory.createMany({
            data: [
                { categoryId: catDev.id, name: 'React / Next.js', slug: 'react-nextjs' },
                { categoryId: catDev.id, name: 'Node.js / NestJS', slug: 'nodejs-nestjs' },
                { categoryId: catDev.id, name: 'WordPress / PHP', slug: 'wordpress-php' },
            ],
        });
        const catDesign = await prisma.category.create({
            data: {
                name: 'Design & Graphisme',
                slug: 'design-graphisme',
            },
        });
        await prisma.subCategory.createMany({
            data: [
                { categoryId: catDesign.id, name: 'UI/UX Design Mobile & Web', slug: 'ui-ux-design' },
                { categoryId: catDesign.id, name: 'Identité Visuelle & Logo', slug: 'logo-branding' },
                { categoryId: catDesign.id, name: 'Montage Vidéo & Motion', slug: 'video-motion' },
            ],
        });
        console.log('✅ Catégories et sous-catégories insérées avec succès !');
    }
    else {
        console.log('ℹ️ Les catégories existent déjà en base de données.');
    }
}
main()
    .catch((e) => {
    console.error('❌ Erreur lors de l\'exécution du seed :', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map