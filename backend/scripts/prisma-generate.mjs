import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.env.DATABASE_URL ||= 'postgresql://127.0.0.1:5432/softgate';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const result = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
  cwd,
});

process.exit(result.status === null ? 1 : result.status);
