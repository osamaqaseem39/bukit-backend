import { NestFactory } from '@nestjs/core';
import { GamingModule } from './gaming.module';

const CORS_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://bukit-dashboard.vercel.app',
];

async function bootstrap() {
  const app = await NestFactory.create(GamingModule);

  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
