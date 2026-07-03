import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] || 'supersecretkey',
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable ou session expirée');
    }
    
    if (user.isSuspended) {
      if (user.suspendedUntil && new Date(user.suspendedUntil) < new Date()) {
        // La suspension est terminée, on la lève
        await this.prisma.user.update({
          where: { id: user.id },
          data: { isSuspended: false, suspendedUntil: null },
        });
      } else {
        throw new UnauthorizedException('Votre compte a été suspendu');
      }
    }
    
    return { id: user.id, email: user.email, role: user.role };
  }
}
