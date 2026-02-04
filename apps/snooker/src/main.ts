import { NestFactory } from '@nestjs/core';
import { SnookerModule } from './snooker.module';

const CORS_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bukit-dashboard.vercel.app',
];

async function bootstrap() {
  const app = await NestFactory.create(SnookerModule);

  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3006);
}
bootstrap();
