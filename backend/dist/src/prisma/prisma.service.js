"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
let PrismaService = class PrismaService extends client_1.PrismaClient {
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
        }
        catch (e) {
            console.error('Erreur de parsing de DATABASE_URL, utilisation des paramètres par défaut', e);
        }
        const adapter = new adapter_mariadb_1.PrismaMariaDb({
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
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map