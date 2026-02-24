import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CricketService } from './cricket.service';
import { CricketController } from './cricket.controller';
import { CricketGround } from './cricket.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CricketGround]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [CricketController],
  providers: [CricketService],
  exports: [CricketService],
})
export class CricketModule {}
