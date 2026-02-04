import { NestFactory } from '@nestjs/core';
import { TableTennisModule } from './table-tennis.module';

async function bootstrap() {
  const app = await NestFactory.create(TableTennisModule);

  await app.listen(process.env.PORT ?? 3007);
}
bootstrap();
