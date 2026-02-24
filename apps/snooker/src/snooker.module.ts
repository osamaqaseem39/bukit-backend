import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnookerService } from './snooker.service';
import { SnookerController } from './snooker.controller';
import { SnookerTable } from './snooker.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SnookerTable]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [SnookerController],
  providers: [SnookerService],
  exports: [SnookerService],
})
export class SnookerModule {}
