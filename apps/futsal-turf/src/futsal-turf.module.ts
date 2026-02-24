import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FutsalTurfService } from './futsal-turf.service';
import { FutsalTurfController } from './futsal-turf.controller';
import { FutsalTurf } from './futsal-turf.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FutsalTurf]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [FutsalTurfController],
  providers: [FutsalTurfService],
  exports: [FutsalTurfService],
})
export class FutsalTurfModule {}
