import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableTennisService } from './table-tennis.service';
import { TableTennisController } from './table-tennis.controller';
import { TableTennisTable } from './table-tennis.entity';
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
    TypeOrmModule.forFeature([TableTennisTable]),
    UsersModule,
  ],
  controllers: [TableTennisController],
  providers: [TableTennisService],
  exports: [TableTennisService],
})
export class TableTennisModule {}
