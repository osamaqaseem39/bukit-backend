import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FutsalTurfService } from './futsal-turf.service';
import { FutsalTurfController } from './futsal-turf.controller';
import { FutsalTurf } from './futsal-turf.entity';
import { UsersModule } from '../auth/src/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // DEV only, disable in production
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([FutsalTurf]),
    UsersModule,
  ],
  controllers: [FutsalTurfController],
  providers: [FutsalTurfService],
  exports: [FutsalTurfService],
})
export class FutsalTurfModule {}
