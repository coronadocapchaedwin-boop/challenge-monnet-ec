import { test as base } from '../../shared/fixtures/base.fixture';
import { attachFailureLog } from '../../shared/utils/failure-log';
import { PokemonClient } from '../clients/pokemon/pokemon.client';
import { PostsClient } from '../clients/posts/posts.client';

interface ApiFixtures {
  pokemonClient: PokemonClient;
  postsClient: PostsClient;
  failureLog: void;
}

export const test = base.extend<ApiFixtures>({
  pokemonClient: async ({ request, environment }, use) => {
    await use(new PokemonClient(request, environment.pokemonApiUrl));
  },
  postsClient: async ({ request, environment }, use) => {
    await use(new PostsClient(request, environment.postsApiUrl));
  },
  failureLog: [
    async ({}, use, testInfo) => {
      await use();
      await attachFailureLog(testInfo);
    },
    { auto: true },
  ],
});

export { expect } from '../../shared/fixtures/base.fixture';
