import { copyFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const srcDir = join(root, 'src', 'mail', 'templates');
const destDir = join(root, 'dist', 'mail', 'templates');

await mkdir(destDir, { recursive: true });
const files = await readdir(srcDir);
for (const name of files) {
  if (!name.endsWith('.html')) continue;
  await copyFile(join(srcDir, name), join(destDir, name));
}
