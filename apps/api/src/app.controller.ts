import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealthPage(@Res() res: Response) {
    const timestamp = new Date().toISOString();
    res.type('html').send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Bukit API - Health Status</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: radial-gradient(circle at top left, #0ea5e9, #1e293b 55%, #020617);
              color: #e5e7eb;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              width: 100%;
            }
            .card {
              background: rgba(15, 23, 42, 0.9);
              border-radius: 16px;
              padding: 32px;
              box-shadow: 0 20px 40px rgba(15, 23, 42, 0.6);
              border: 1px solid rgba(148, 163, 184, 0.35);
              backdrop-filter: blur(18px);
            }
            .header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 24px;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 6px 12px;
              border-radius: 999px;
              background: rgba(16, 185, 129, 0.16);
              color: #6ee7b7;
              font-size: 12px;
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
              animation: pulse 2s ease-in-out infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            h1 {
              font-size: 28px;
              font-weight: 600;
              letter-spacing: -0.02em;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 14px;
              color: #9ca3af;
              margin-bottom: 24px;
            }
            .info-grid {
              display: grid;
              gap: 16px;
              margin-bottom: 24px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid rgba(148, 163, 184, 0.1);
            }
            .info-row:last-child {
              border-bottom: none;
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
              font-size: 14px;
            }
            .muted {
              color: #9ca3af;
              font-size: 12px;
            }
            .endpoints {
              margin-top: 24px;
              padding-top: 24px;
              border-top: 1px solid rgba(148, 163, 184, 0.1);
            }
            .endpoints-title {
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #6b7280;
              margin-bottom: 12px;
              font-weight: 600;
            }
            .endpoint {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              font-size: 13px;
            }
            .endpoint-path {
              color: #9ca3af;
              font-family: 'Courier New', monospace;
            }
            .endpoint-desc {
              color: #6b7280;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="badge">
                  <span class="dot"></span>
                  <span>Healthy</span>
                </div>
              </div>
              <h1>Bukit API Gateway</h1>
              <p class="subtitle">The API gateway is up and responding to requests.</p>
              
              <div class="info-grid">
                <div class="info-row">
                  <span class="label">Service</span>
                  <span class="value">api-gateway</span>
                </div>
                <div class="info-row">
                  <span class="label">Status</span>
                  <span class="value">ok</span>
                </div>
                <div class="info-row">
                  <span class="label">Time (UTC)</span>
                  <span class="muted">${timestamp}</span>
                </div>
              </div>

              <div class="endpoints">
                <div class="endpoints-title">Available Endpoints</div>
                <div class="endpoint">
                  <span class="endpoint-path">GET /</span>
                  <span class="endpoint-desc">This health page</span>
                </div>
                <div class="endpoint">
                  <span class="endpoint-path">GET /health</span>
                  <span class="endpoint-desc">JSON health check</span>
                </div>
                <div class="endpoint">
                  <span class="endpoint-path">GET /auth/*</span>
                  <span class="endpoint-desc">Auth service proxy</span>
                </div>
                <div class="endpoint">
                  <span class="endpoint-path">GET /gaming/*</span>
                  <span class="endpoint-desc">Gaming service proxy</span>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
