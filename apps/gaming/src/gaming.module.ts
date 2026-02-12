import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamingController } from './gaming.controller';
import { GamingService } from './gaming.service';
import { GamingCenter } from './gaming.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    // ConfigModule is already global from AuthModule, no need to re-import
    // TypeORM root connection is already set up in AuthModule, so we just use forFeature
    TypeOrmModule.forFeature([GamingCenter]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [GamingController],
  providers: [GamingService],
  exports: [GamingService],
})
export class GamingModule {}
