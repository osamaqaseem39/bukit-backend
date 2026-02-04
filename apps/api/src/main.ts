import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

const CORS_ALLOWED_ORIGINS: string[] = [
  'http://localhost:3000', // Local web app
  'http://localhost:5173', // Local admin dashboard
  'https://bukit-dashboard.vercel.app', // Deployed admin dashboard
];

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const server = app.getHttpAdapter().getInstance();

  const authTarget =
    process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';
  const gamingTarget =
    process.env.GAMING_SERVICE_URL ?? 'http://localhost:3002';

  // Proxy auth-related routes to the auth service
  server.use(
    ['/auth', '/locations', '/uploads'],
    createProxyMiddleware({
      target: authTarget,
      changeOrigin: true,
      pathRewrite: {
        // Keep paths as-is; just forward
      },
    }),
  );

  // Proxy gaming routes to the gaming service
  server.use(
    ['/gaming'],
    createProxyMiddleware({
      target: gamingTarget,
      changeOrigin: true,
      pathRewrite: {
        // Keep paths as-is; just forward
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
