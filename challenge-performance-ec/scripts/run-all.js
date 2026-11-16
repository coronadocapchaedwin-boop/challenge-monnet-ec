import { spawnSync } from 'node:child_process';

let failed = false;

for (const tps of ['50', '100']) {
  const run = spawnSync(process.execPath, [
    'scripts/run.js',
    'tests/products/create-product.test.js',
    tps,
  ], {
    stdio: 'inherit',
    env: process.env,
  });
  failed ||= run.status !== 0;
}

spawnSync(process.execPath, ['scripts/executive-report.js'], {
  stdio: 'inherit',
  env: process.env,
});

process.exit(failed ? 1 : 0);
