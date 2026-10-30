import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
const root = resolve('dist');
async function walk(directory) {
  return (
    await Promise.all(
      (await readdir(directory, { withFileTypes: true })).map((entry) =>
        entry.isDirectory()
          ? walk(resolve(directory, entry.name))
          : [resolve(directory, entry.name)],
      ),
    )
  ).flat();
}
const paths = (await walk(root))
  .filter((path) => !['sw.js', 'offline-manifest.json'].includes(relative(root, path)))
  .sort();
const files = await Promise.all(
  paths.map(async (path) => ({
    path: '/' + relative(root, path).replaceAll('\\', '/'),
    size: (await stat(path)).size,
    sha256: createHash('sha256')
      .update(await readFile(path))
      .digest('hex'),
  })),
);
const version = createHash('sha256').update(JSON.stringify(files)).digest('hex').slice(0, 16);
const shell = files
  .filter(
    (file) =>
      file.path === '/index.html' ||
      file.path === '/favicon.svg' ||
      file.path === '/manifest.webmanifest' ||
      /\.(js|css)$/.test(file.path),
  )
  .map((file) => file.path);
const manifest = { version, files, shell };
const worker = await readFile('public/sw.js', 'utf8');
await writeFile(
  resolve(root, 'sw.js'),
  'const OFFLINE_MANIFEST = ' + JSON.stringify(manifest) + ';\n' + worker,
);
await writeFile(resolve(root, 'offline-manifest.json'), JSON.stringify(manifest));
console.log(
  `Offline bundle ${version}: ${files.length} files, ${(files.reduce((sum, file) => sum + file.size, 0) / 1048576).toFixed(1)} MiB. Public static files only.`,
);
