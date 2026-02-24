import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableTennisService } from './table-tennis.service';
import { TableTennisController } from './table-tennis.controller';
import { TableTennisTable } from './table-tennis.entity';
import { UsersModule } from '../../auth/src/users/users.module';
import { ClientsModule } from '../../auth/src/clients/clients.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableTennisTable]),
    UsersModule,
    ClientsModule,
  ],
  controllers: [TableTennisController],
  providers: [TableTennisService],
  exports: [TableTennisService],
})
export class TableTennisModule {}
