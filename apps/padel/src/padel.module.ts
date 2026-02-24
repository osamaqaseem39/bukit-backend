import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PadelService } from './padel.service';
import { PadelController } from './padel.controller';
import { PadelCourt } from './padel.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PadelCourt]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [PadelController],
  providers: [PadelService],
  exports: [PadelService],
})
export class PadelModule {}
