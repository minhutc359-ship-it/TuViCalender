import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';
import { gzipSync } from 'node:zlib';
import { mkdir, rm } from 'node:fs/promises';
const limit = 50 * 1048576;
const root = resolve('dist');
if (process.env.VITE_ENABLE_REFERENCE_ART === 'false')
  await rm(resolve(root, 'assets/tarot/jojo-ref'), { recursive: true, force: true });
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
const worker = await readFile('public/sw.js', 'utf8');
const version = createHash('sha256')
  .update(worker)
  .update(JSON.stringify(files))
  .digest('hex')
  .slice(0, 16);
const packFor = (path) =>
  path.startsWith('/content/eastern/')
    ? 'eastern'
    : path.startsWith('/content/western/')
      ? 'western'
      : path.startsWith('/content/tarot/') || path.startsWith('/assets/tarot/')
        ? 'tarot'
        : 'core';
const shell = files.filter((file) => packFor(file.path) === 'core').map((file) => file.path);
const packs = ['core', 'eastern', 'western', 'tarot'].map((id) => {
  const entries = files.filter((file) => packFor(file.path) === id);
  return {
    id,
    version,
    locale: 'vi',
    schemaVersion: 1,
    size: entries.reduce((n, f) => n + f.size, 0),
    files: entries.map((file) => file.path),
    checksum: createHash('sha256').update(JSON.stringify(entries)).digest('hex'),
    dependencies: id === 'core' ? [] : ['core'],
  };
});
const manifest = { version, schemaVersion: 1, files, shell, packs };
await writeFile(
  resolve(root, 'sw.js'),
  'const OFFLINE_MANIFEST = ' + JSON.stringify(manifest) + ';\n' + worker,
);
await writeFile(resolve(root, 'offline-manifest.json'), JSON.stringify(manifest));
const allPaths = await walk(root);
const sizes = await Promise.all(
  allPaths.map(async (path) => {
    const bytes = await readFile(path);
    const name = relative(root, path);
    // Binary artwork is already compressed; only estimate gzip for compressible resources.
    const compressible = /\.(js|css|html|json|svg|webmanifest|txt)$/.test(name);
    return {
      path: '/' + name.replaceAll('\\', '/'),
      storageBytes: bytes.length,
      gzipTransferBytes: compressible
        ? Math.min(bytes.length, gzipSync(bytes).length)
        : bytes.length,
    };
  }),
);
const sum = (key) => sizes.reduce((n, f) => n + f[key], 0);
const report = {
  version,
  limitBytes: limit,
  fileCount: sizes.length,
  storageBytes: sum('storageBytes'),
  estimatedGzipTransferBytes: sum('gzipTransferBytes'),
  coreStorageBytes: files.filter((f) => shell.includes(f.path)).reduce((n, f) => n + f.size, 0),
  packs: packs.map((p) => ({
    id: p.id,
    size: p.size,
    fileCount: p.files.length,
    checksum: p.checksum,
  })),
  files: sizes,
  note: 'Gzip estimate assumes HTTP compression for text. Raw bytes also gated at 50 MiB, including worker and manifest. Browser metadata, user data and old update caches excluded.',
};
await mkdir('reports', { recursive: true });
await writeFile('reports/offline-size.json', JSON.stringify(report, null, 2) + '\n');
if (report.storageBytes > limit || report.estimatedGzipTransferBytes > limit)
  throw new Error(
    `Offline bundle exceeds 50 MiB: ${(report.storageBytes / 1048576).toFixed(2)} MiB raw, ${(report.estimatedGzipTransferBytes / 1048576).toFixed(2)} MiB gzip estimate.`,
  );
console.log(
  `Offline bundle ${version}: ${files.length} files, ${(files.reduce((sum, file) => sum + file.size, 0) / 1048576).toFixed(1)} MiB. Public static files only.`,
);
console.log(
  `Budget: ${(report.estimatedGzipTransferBytes / 1048576).toFixed(2)} MiB gzip estimate; ${(report.storageBytes / 1048576).toFixed(2)} MiB raw, including metadata. Limit: 50 MiB.`,
);
