import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

const [testFile, tps] = process.argv.slice(2);
const environment = process.env.ENV || 'qa';
const envFile = `.env.${environment}`;
const testName = testFile
  .split('/')
  .slice(1)
  .join('-')
  .replace('.test.js', '');

dotenv.config({
  path: envFile,
  override: true,
  quiet: true,
});

const result = spawnSync('k6', [
  'run',
  '-e', `TPS=${tps}`,
  '-e', `ENV=${environment}`,
  '-e', `TEST_NAME=${testName}`,
  testFile,
], { stdio: 'inherit', env: process.env });

if (result.error) throw result.error;

process.exit(result.status ?? 1);
