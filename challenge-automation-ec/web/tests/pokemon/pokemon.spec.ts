import { stat } from 'node:fs/promises';
import path from 'node:path';
import { test, expect } from '../../fixtures/web.fixture';
import { readPokemonData } from '../../../shared/data/excel.reader';

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];

// ARRANGE (Preparación): Leer el Excel y registrar un escenario por cada Pokémon.
for (const pokemon of readPokemonData()) {
  test(`Wikipedia artwork - ${pokemon.name} - Row ${pokemon.excelRow}`,
    async ({ page, pokemonPage }, testInfo) => {

      // ARRANGE (Preparación): Construir el título esperado a partir del nombre del Excel.
      const title = pokemon.name[0].toUpperCase() + pokemon.name.slice(1);

      // ACT (Acción): Abrir la página del Pokémon en Wikipedia.
      await pokemonPage.open(title);

      // ASSERT (Validación): Comprobar el título de la página.
      await expect(page).toHaveTitle(`${title} - Wikipedia`);

      // ASSERT (Validación): Comprobar que el crédito de la ilustración no esté vacío.
      await expect(pokemonPage.artworkCredit).not.toBeEmpty();

      // ACT (Acción): Leer y registrar el crédito de la ilustración.
      const credit = await pokemonPage.artworkCredit.innerText();
      console.log(`Artwork credit: ${credit}`);

      // ACT (Acción): Descargar la ilustración mediante los controles de la página.
      const image = await pokemonPage.downloadArtwork();

      // ACT (Acción): Obtener el tamaño y la extensión del archivo descargado.
      const { size } = await stat(image);
      const extension = path.extname(image).toLowerCase();

      // ASSERT (Validación): Comprobar la extensión permitida y el tamaño menor a 500000 bytes.
      expect(allowedExtensions).toContain(extension);
      expect(size).toBeLessThan(500_000);

      // EVIDENCIA: Adjuntar la imagen descargada al reporte de Playwright.
      await testInfo.attach('artwork', { path: image });
    }
  );
}

// DEMOSTRACIÓN: Descomentar este test para provocar un fallo y revisar captura, video, trace y failure.log.
/*
test('Evidencias cuando falla una prueba', async ({ page, pokemonPage }) => {
  // ARRANGE (Preparación): Abrir una página válida para disponer de contexto real.
  await pokemonPage.open('Pikachu');

  // ACT (Acción): Obtener el título mostrado por el navegador.
  const title = await page.title();

  // ASSERT (Validación): fallo controlado para revisar evidencias.
  expect(title).toBe('Título incorrecto para demostrar el diagnóstico');
});
*/
