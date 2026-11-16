import { test, expect } from '../../fixtures/api.fixture';
import { readPokemonData } from '../../../shared/data/excel.reader';
import type { PokemonRow } from '../../../shared/data/excel.reader';
import type { PokemonResponse } from '../../clients/pokemon/pokemon.client';
import type { ApiResult } from '../../clients/api-client';

// ARRANGE (Preparación): Leer del Excel los datos y resultados esperados de cada Pokémon.
const pokemons = readPokemonData();

function validatePokemon(
  response: ApiResult<PokemonResponse>,
  expected: PokemonRow,
) {
  // ASSERT (Validación): Comprobar estado HTTP, tiempo de respuesta, identidad y habilidades.
  expect(response.status).toBe(200);
  expect(response.responseTimeMs).toBeLessThan(10_000);
  expect(response.body.id).toBe(expected.id);
  expect(response.body.name).toBe(expected.name);
  expect(Array.isArray(response.body.abilities)).toBe(true);

  const actualAbilities = response.body.abilities.map(({ ability }) => ability.name);
  expect(actualAbilities.sort()).toEqual([...expected.abilities].sort());
}

test.describe('Pokemon API', () => {
  for (const pokemon of pokemons) {
    test(`GET by ID - ${pokemon.name} - Row ${pokemon.excelRow}`, async ({ pokemonClient }) => {
        // ARRANGE (Preparación): Usar el Pokémon de esta fila y el cliente entregado por el fixture.
        // ACT (Acción): Consultar el Pokémon por su ID.
        const response = await pokemonClient.getById(pokemon.id);

        // ASSERT (Validación): Comparar la respuesta con los valores esperados del Excel.
        validatePokemon(response, pokemon);
      });

    test(`GET by Name - ${pokemon.name} - Row ${pokemon.excelRow}`, async ({ pokemonClient }) => {
      // ARRANGE (Preparación): Usar el Pokémon de esta fila y el cliente entregado por el fixture.
      // ACT (Acción): Consultar el Pokémon por su nombre.
      const response = await pokemonClient.getByName(pokemon.name);

      // ASSERT (Validación): Comparar la respuesta con los valores esperados del Excel.
      validatePokemon(response, pokemon);
    });
  }

  // DEMOSTRACIÓN: Descomentar este test para provocar un fallo y revisar failure.log en el reporte API.
  /*
  test('Evidencias cuando falla una prueba', async ({ pokemonClient }) => {
    // ARRANGE (Preparación): Usar un Pokémon existente para obtener una respuesta real.
    // ACT (Acción): Consultar el Pokémon por su ID.
    const response = await pokemonClient.getById(25);

    // ASSERT (Validación): Provocar un fallo controlado para revisar el reporte API.
    expect(response.status).toBe(201);
  });
  */
});
