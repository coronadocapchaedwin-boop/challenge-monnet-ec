import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export class PokemonPage {
  constructor(private readonly page: Page) {}

  // Localizadores de la ficha y del visor de medios de Wikipedia.
  get artworkCredit() {
    return this.page.locator('.infobox .infobox-caption');
  }

  private get artworkLink() {
    return this.page.locator('.infobox-image a.mw-file-description');
  }

  private get downloadMenu() {
    return this.page.getByRole('button', { name: 'Download this file', exact: true });
  }

  private get downloadLink() {
    return this.page.getByRole('link', { name: 'Download', exact: true });
  }

  // Navegación a la ficha del Pokémon usando la URL base del fixture.
  async open(title: string): Promise<void> {
    await this.page.goto(`/wiki/${title}`);
  }

  // Descarga interactiva de la imagen principal en la carpeta images del proyecto.
  async downloadArtwork(): Promise<string> {
    await this.artworkLink.click();

    // El visor muestra el botón antes de que la URL del archivo esté lista.
    await expect(this.downloadMenu).toHaveAttribute('href', /^https?:/);
    await this.downloadMenu.click();

    // La espera se registra antes del clic que inicia la descarga.
    const pendingDownload = this.page.waitForEvent('download');
    await this.downloadLink.click();
    const download = await pendingDownload;

    const directory = path.resolve(__dirname, '../../..', 'images');
    await mkdir(directory, { recursive: true });
    const destination = path.join(directory, path.basename(download.suggestedFilename()));

    // saveAs reemplaza el archivo en la misma ruta en ejecuciones posteriores.
    await download.saveAs(destination);
    return destination;
  }
}
