import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const manifest = JSON.parse(await readFile('dist/offline-manifest.json', 'utf8'));
assert.deepEqual(
  manifest.packs.map((p) => p.id),
  ['core', 'eastern', 'western', 'tarot'],
);
const paths = new Set(manifest.files.map((f) => f.path));
assert.equal(paths.size, manifest.files.length);
const owned = manifest.packs.flatMap((p) => p.files);
assert.equal(new Set(owned).size, owned.length);
assert.equal(owned.length, paths.size);
const digest = (b) => createHash('sha256').update(b).digest('hex');
for (const file of manifest.files) {
  assert.ok(file.path.startsWith('/') && !file.path.includes('..'));
  const bytes = await readFile(resolve('dist', '.' + file.path));
  assert.equal(bytes.length, file.size);
  assert.equal(digest(bytes), file.sha256);
}
for (const pack of manifest.packs) {
  const files = manifest.files.filter((f) => pack.files.includes(f.path));
  assert.equal(digest(JSON.stringify(files)), pack.checksum);
  assert.equal(
    files.reduce((n, f) => n + f.size, 0),
    pack.size,
  );
}
assert.deepEqual(new Set(manifest.shell), new Set(manifest.packs[0].files));
assert.ok(manifest.packs[0].size <= 8 * 1048576);
const app = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
for (const size of [192, 512]) {
  const icon = app.icons.find((i) => i.sizes === `${size}x${size}`);
  assert.ok(icon);
  const bytes = await readFile('dist' + icon.src);
  assert.equal(bytes.readUInt32BE(16), size);
  assert.equal(bytes.readUInt32BE(20), size);
}
const report = JSON.parse(await readFile('reports/offline-size.json', 'utf8'));
assert.ok(report.storageBytes <= 50 * 1048576 && report.estimatedGzipTransferBytes <= 50 * 1048576);
const illustrations = manifest.files.filter((file) => file.path.startsWith('/assets/illustrations/'));
assert.equal(illustrations.length, 6);
assert.ok(
  illustrations.every((file) =>
    manifest.packs.find((pack) => pack.id === 'core').files.includes(file.path),
  ),
);
if (process.env.VITE_ENABLE_REFERENCE_ART === 'false')
  assert.ok(!manifest.files.some((file) => file.path.includes('/jojo-ref/')));
else {
  const jojoFiles = manifest.files.filter((file) => file.path.includes('/jojo-ref/'));
  assert.equal(jojoFiles.length, 101);
  const tarotPack = manifest.packs.find((pack) => pack.id === 'tarot');
  assert.ok(jojoFiles.every((file) => tarotPack.files.includes(file.path)));
}
console.log(
  `Verified four packs: ${manifest.files.length} unique files, SHA-256/size/ownership/dependencies/icons and 50 MiB gate.`,
);
