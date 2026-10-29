import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/services/dataStore.js';
import { apiRouter } from './server/routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize database engine & seed state
  await db.initialize();

  // Mount API endpoints
  app.use('/api', apiRouter);

  // Healthcheck endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 StaffSync HRMS Server is listening on port ${PORT}`);
    console.log(`📱 Mode: ${isProduction ? 'Production' : 'Development with Vite middleware'}`);
    console.log(`🔗 API Base: http://0.0.0.0:${PORT}/api`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('[StaffSync] Fatal server startup error:', err);
  process.exit(1);
});
