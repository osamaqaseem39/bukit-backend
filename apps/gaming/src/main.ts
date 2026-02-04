import { NestFactory } from '@nestjs/core';
import { GamingModule } from './gaming.module';

async function bootstrap() {
  const app = await NestFactory.create(GamingModule);

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
