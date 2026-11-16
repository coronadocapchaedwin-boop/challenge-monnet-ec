import { test as base } from '../../shared/fixtures/base.fixture';
import { attachFailureLog } from '../../shared/utils/failure-log';
import { PokemonPage } from '../pages/pokemon/pokemon.page';

interface WebFixtures {
  pokemonPage: PokemonPage;
  failureLog: void;
}

export const test = base.extend<WebFixtures>({
  baseURL: async ({ environment }, use) => {
    await use(environment.wikipediaUrl);
  },
  pokemonPage: async ({ page }, use) => {
    await use(new PokemonPage(page));
  },
  failureLog: [
    async ({ page }, use, testInfo) => {
      await use();
      await attachFailureLog(testInfo, page.url());
    },
    { auto: true },
  ],
});

export { expect } from '../../shared/fixtures/base.fixture';
