import { NestFactory } from '@nestjs/core';
import { CricketModule } from './cricket.module';

async function bootstrap() {
  const app = await NestFactory.create(CricketModule);

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
