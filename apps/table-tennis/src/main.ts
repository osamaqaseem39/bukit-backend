import { NestFactory } from '@nestjs/core';
import { TableTennisModule } from './table-tennis.module';

const CORS_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bukit-dashboard.vercel.app',
];

async function bootstrap() {
  const app = await NestFactory.create(TableTennisModule);

  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3007);
}
bootstrap();
