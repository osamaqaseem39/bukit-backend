import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

// CORS configuration similar to your example:
// - Supports explicit origins via ALLOWED_ORIGINS
// - Supports suffix-based matches via ALLOWED_ORIGIN_SUFFIXES (e.g. .vercel.app)
const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3000,http://localhost:5173,https://bukit-dashboard.vercel.app'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOriginSuffixes = (
  process.env.ALLOWED_ORIGIN_SUFFIXES || '.vercel.app'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const wildcardAllowed = allowedOrigins.includes('*');
      const exactAllowed = allowedOrigins.includes(origin);
      const suffixAllowed = allowedOriginSuffixes.some((suffix) =>
        origin.endsWith(suffix),
      );

      if (wildcardAllowed || exactAllowed || suffixAllowed) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
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

  const server = app.getHttpAdapter().getInstance();

  // Basic health check endpoints
  server.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    });
  });

  server.get('/health/html', (_req, res) => {
    res.type('html').send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Bukit API Health</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: radial-gradient(circle at top left, #0ea5e9, #1e293b 55%, #020617);
              color: #e5e7eb;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: rgba(15, 23, 42, 0.9);
              border-radius: 16px;
              padding: 24px 28px;
              max-width: 420px;
              width: 100%;
              box-shadow: 0 20px 40px rgba(15, 23, 42, 0.6);
              border: 1px solid rgba(148, 163, 184, 0.35);
              backdrop-filter: blur(18px);
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 10px;
              border-radius: 999px;
              background: rgba(16, 185, 129, 0.16);
              color: #6ee7b7;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-weight: 600;
            }
            .dot {
              width: 8px;
              height: 8px;
              border-radius: 999px;
              background: #22c55e;
              box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.22);
            }
            h1 {
              margin: 14px 0 4px;
              font-size: 22px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            .subtitle {
              font-size: 13px;
              color: #9ca3af;
              margin-bottom: 16px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 12px;
              font-size: 12px;
              color: #9ca3af;
            }
            .row + .row {
              margin-top: 4px;
            }
            .label {
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-weight: 500;
              font-size: 11px;
              color: #6b7280;
            }
            .value {
              font-weight: 500;
              color: #e5e7eb;
            }
            .muted {
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <main class="card">
            <div class="badge">
              <span class="dot"></span>
              <span>Healthy</span>
            </div>
            <h1>Bukit API Gateway</h1>
            <p class="subtitle">The API gateway is up and responding.</p>
            <div class="row">
              <span class="label">Service</span>
              <span class="value">api-gateway</span>
            </div>
            <div class="row">
              <span class="label">Status</span>
              <span class="value">ok</span>
            </div>
            <div class="row">
              <span class="label">Time (UTC)</span>
              <span class="muted">${new Date().toISOString()}</span>
            </div>
          </main>
        </body>
      </html>
    `);
  });

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
