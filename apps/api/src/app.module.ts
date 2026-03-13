import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../../auth/src/auth.module';
import { GamingModule } from '../../gaming/src/gaming.module';
import { SnookerModule } from '../../snooker/src/snooker.module';
import { TableTennisModule } from '../../table-tennis/src/table-tennis.module';

@Module({
  imports: [
    AuthModule,
    GamingModule,
    SnookerModule,
    TableTennisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
