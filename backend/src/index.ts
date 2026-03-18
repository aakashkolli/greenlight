import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { projectsRouter } from './routes/projects';
import { contributionsRouter } from './routes/contributions';
import { usersRouter } from './routes/users';

// __dirname = backend/src → ../../ = repo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/projects', projectsRouter);
app.use('/contributions', contributionsRouter);
app.use('/users', usersRouter);

// Start blockchain listener in background (non-blocking)
if (process.env.NEXT_PUBLIC_CHAIN_RPC && process.env.NEXT_PUBLIC_FACTORY_ADDRESS) {
  import('./services/blockchainListener').then(({ startListener }) => {
    startListener().catch((err) => {
      console.error('Blockchain listener failed to start:', err.message);
    });
  });
} else {
  console.warn('Blockchain listener disabled: NEXT_PUBLIC_CHAIN_RPC or NEXT_PUBLIC_FACTORY_ADDRESS not set');
}

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
