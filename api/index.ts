import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../apps/api/src/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { VercelRequest, VercelResponse } from '@vercel/node';

let cachedApp: NestExpressApplication;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable global validation pipe
    cachedApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // CORS configuration
    cachedApp.enableCors({
      // In this phase, allow all origins to avoid CORS-related 500s
      // (Vercel preflight OPTIONS hitting "Not allowed by CORS").
      // You can tighten this later with an allowlist.
      origin: true,
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      maxAge: 600,
    });

    const server = cachedApp.getHttpAdapter().getInstance();

    const authTarget = process.env.AUTH_SERVICE_URL;
    const gamingTarget = process.env.GAMING_SERVICE_URL;

    // Only proxy auth routes if AUTH_SERVICE_URL is explicitly set and not localhost
    // Otherwise, AuthModule handles routes directly
    if (
      authTarget &&
      !authTarget.includes('localhost') &&
      !authTarget.includes('127.0.0.1')
    ) {
      console.log(`Proxying auth routes to external service: ${authTarget}`);
      server.use(
        ['/auth', '/locations', '/uploads'],
        createProxyMiddleware({
          target: authTarget,
          changeOrigin: true,
          pathRewrite: {},
          timeout: 50000,
          proxyTimeout: 50000,
          onError: (err, req, res) => {
            console.error('Proxy error:', err.message);
            if (!res.headersSent) {
              res.status(502).json({
                error: 'Bad Gateway',
                message: 'Unable to connect to auth service',
                target: authTarget,
              });
            }
          },
        } as any), // Type assertion needed as @types/http-proxy-middleware doesn't include onError
      );
    } else {
      console.log(
        'AuthModule imported directly - auth routes handled by NestJS (no proxy)',
      );
    }

    // Only proxy gaming routes if GAMING_SERVICE_URL is explicitly set and not localhost
    if (
      gamingTarget &&
      !gamingTarget.includes('localhost') &&
      !gamingTarget.includes('127.0.0.1')
    ) {
      console.log(`Proxying gaming routes to external service: ${gamingTarget}`);
      server.use(
        ['/gaming'],
        createProxyMiddleware({
          target: gamingTarget,
          changeOrigin: true,
          pathRewrite: {},
          timeout: 50000,
          proxyTimeout: 50000,
          onError: (err, req, res) => {
            console.error('Proxy error:', err.message);
            if (!res.headersSent) {
              res.status(502).json({
                error: 'Bad Gateway',
                message: 'Unable to connect to gaming service',
                target: gamingTarget,
              });
            }
          },
        } as any), // Type assertion needed as @types/http-proxy-middleware doesn't include onError
      );
    }

    await cachedApp.init();
  }
  return cachedApp.getHttpAdapter().getInstance();
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set a timeout to ensure response is sent before Vercel's timeout
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        error: 'Gateway Timeout',
        message: 'Request took too long to process',
      });
    }
  }, 55000); // 55 seconds (5 seconds before Vercel's 60s timeout)

  try {
    const expressApp = await bootstrap();
    
    // Handle the request with proper cleanup
    expressApp(req, res);
    
    // Clear timeout if request completes
    res.on('finish', () => {
      clearTimeout(timeout);
    });
  } catch (error) {
    clearTimeout(timeout);
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
