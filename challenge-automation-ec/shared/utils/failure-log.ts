import { writeFile } from 'node:fs/promises';
import { stripVTControlCharacters } from 'node:util';
import type { TestInfo } from '@playwright/test';

export async function attachFailureLog(testInfo: TestInfo, url?: string): Promise<void> {
  if (testInfo.status === testInfo.expectedStatus) return;

  const error = testInfo.error?.stack ?? testInfo.error?.message ?? 'Error no disponible.';
  const log = [
    `Test: ${testInfo.title}`,
    `Estado: ${testInfo.status}`,
    `Fecha: ${new Date().toISOString()}`,
    ...(url ? [`URL: ${url}`] : []),
    '',
    stripVTControlCharacters(error),
  ].join('\n');
  const logPath = testInfo.outputPath('failure.log');

  await writeFile(logPath, log, 'utf8');
  await testInfo.attach('failure.log', { path: logPath, contentType: 'text/plain' });
}
