import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../../auth/src/auth.module';
import { GamingModule } from '../../gaming/src/gaming.module';

@Module({
  imports: [AuthModule, GamingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
