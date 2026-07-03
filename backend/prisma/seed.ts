import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

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
} catch (e) {
  console.error('Erreur lors du parsing de DATABASE_URL pour le seeding.', e);
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 2,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Démarrage du peuplement (seeding) de la base de données...');

  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'azertyui';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Création de l'administrateur
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
  } else {
    console.log(`ℹ️ L'administrateur existe déjà.`);
  }

  // 2. Création des Catégories & Sous-Catégories de démo si la table Category est vide
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    console.log('🌱 Ajout des catégories de projets...');
    
    // Catégorie 1
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

    // Catégorie 2
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
  } else {
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
