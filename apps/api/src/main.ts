import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN_WEB,
      process.env.CORS_ORIGIN_ADMIN,
      process.env.CORS_ORIGIN_ADMIN_PROD,
    ].filter(Boolean),
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
