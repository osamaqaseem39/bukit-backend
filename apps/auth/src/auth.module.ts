import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { UploadController } from './upload.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BookingsModule } from './bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Prefer Supabase-style POSTGRES_URL_NON_POOLING / POSTGRES_URL when present,
        // otherwise fall back to individual DB_* vars.
        const url =
          process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;

        if (url) {
          const parsed = new URL(url);
          const sslMode = parsed.searchParams.get('sslmode');

          return {
            type: 'postgres' as const,
            host: parsed.hostname,
            port: Number(parsed.port || 5432),
            username: parsed.username,
            password: parsed.password,
            database: parsed.pathname.replace(/^\//, ''),
            autoLoadEntities: true,
            synchronize: true, // DEV only, disable in production
            ssl:
              sslMode === 'require'
                ? { rejectUnauthorized: false }
                : false,
            extra: {
              max: 5,
              min: 1,
              idleTimeoutMillis: 30000,
              connectionTimeoutMillis: 10000,
            },
            retryAttempts: 3,
            retryDelay: 3000,
          };
        }

        // Fallback: explicit DB_* variables
        return {
          type: 'postgres' as const,
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true, // DEV only, disable in production
          ssl:
            configService.get<string>('DB_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : false,
          extra: {
            max: 5,
            min: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },
          retryAttempts: 3,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    ClientsModule,
    BookingsModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'supersecretkey',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRATION') ||
            '3600s') as any,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UploadController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
