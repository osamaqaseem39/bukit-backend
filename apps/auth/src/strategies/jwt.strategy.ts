import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      userId: payload.sub,
      email: payload.email, 
      role: payload.role,
      client_id: payload.client_id ?? null,
      managed_location_id: payload.managed_location_id ?? null,
    };
  }
}
