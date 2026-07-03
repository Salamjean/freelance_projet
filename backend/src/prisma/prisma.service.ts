import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const urlString = process.env['DATABASE_URL'] || 'mysql://root:root@localhost:3306/freelance_db';
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
      console.error('Erreur de parsing de DATABASE_URL, utilisation des paramètres par défaut', e);
    }

    const adapter = new PrismaMariaDb({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
