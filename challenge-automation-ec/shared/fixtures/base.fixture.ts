import { test as base, expect } from '@playwright/test';
import { loadEnvironment, type EnvironmentConfig } from '../config/env';
import { sha256 } from '../utils/crypto';

interface SharedFixtures {
  environment: EnvironmentConfig;
  lifecycleLogging: void;
}

const test = base.extend<SharedFixtures>({
  environment: async ({}, use) => {
    await use(loadEnvironment());
  },

  lifecycleLogging: [
    async ({ environment }, use) => {
      console.log(sha256(environment.secretKey));

      try {
        await use();
      } finally {
        console.log(`Test finished at: ${new Date().toISOString()}`);
      }
    },
    { auto: true, scope: 'test' },
  ],
});

export { test, expect };
