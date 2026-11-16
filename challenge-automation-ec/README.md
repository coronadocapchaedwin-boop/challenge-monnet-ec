# Challenge QA Automation - Monnet Payments

Proyecto de automatización API y Web con Playwright y TypeScript. Los datos de prueba se leen directamente desde `shared/data/Datos-pruebas.xlsx`.

## Requisitos

- Node.js 22 o posterior.
- npm.
- Acceso a PokéAPI, JSONPlaceholder, Wikipedia y Wikimedia.

## Instalación

```bash
npm install
npx playwright install chromium
```

## Ambientes

El proyecto incluye comandos para `qa` y `cert`. Para agregar otro ambiente, por ejemplo `uat`, crear su archivo:

```bash
cp .env.example .env.uat
```

Completar estas variables en el archivo del ambiente:

```text
SECRET_KEY
POKEMON_API_URL
POSTS_API_URL
WIKIPEDIA_URL
```

Después, agregar estos scripts dentro de `scripts` en `package.json`:

```json
"test:uat": "TEST_ENV=uat playwright test",
"test:api:uat": "TEST_ENV=uat playwright test --project=api",
"test:web:uat": "TEST_ENV=uat playwright test --project=web-chromium",
"report:uat": "playwright show-report playwright-report/uat"
```

Ejecutar el ambiente nuevo con:

```bash
npm run test:uat       # API y Web
npm run test:api:uat   # solo API
npm run test:web:uat   # solo Web
npm run report:uat     # abrir reporte
```

Para otro ambiente, como `prod`, reemplazar `uat` por `prod` en el nombre del archivo y en los scripts.

## Ejecución

```bash
npm run test:qa          # API y Web en QA
npm run test:cert        # API y Web en CERT
npm run test:api:qa      # solo API en QA
npm run test:api:cert    # solo API en CERT
npm run test:web:qa      # solo Web en QA
npm run test:web:cert    # solo Web en CERT
```

## Navegador y paralelismo

Estos valores se cambian en `playwright.config.ts`:

```ts
const parallel = true;

fullyParallel: parallel,
workers: parallel ? 4 : 1,

use: {
  headless: false,
}
```

`headless` aplica solo a las pruebas Web:

- `headless: false`: abre Chromium y permite ver la ejecución.
- `headless: true`: ejecuta Chromium sin mostrarlo.

`parallel` controla si las pruebas pueden ejecutarse al mismo tiempo:

- `true`: ejecuta hasta cuatro workers.
- `false`: ejecuta con un worker.

Para cambiar el máximo de workers cuando `parallel` es `true`, modificar el número `4`:

```ts
workers: parallel ? 6 : 1,
```

## Reportes y evidencias

Después de ejecutar las pruebas, abrir el reporte HTML:

```bash
npm run report          # QA
npm run report:cert     # CERT
```

Los reportes se guardan en `playwright-report/<ambiente>`.

Cuando falla una prueba Web, Playwright conserva captura, video, trace y `failure.log`. En API conserva `failure.log` con el test, estado, fecha y stack del error. Los artefactos se guardan en `test-results/<ambiente>/artifacts`.

Al final de los specs de Web, Pokémon API y Posts API hay pruebas de fallo controlado comentadas. Se pueden descomentar temporalmente para comprobar las evidencias y volver a comentar antes de la entrega.

## Datos y cobertura

La hoja `Pokemon` del Excel utiliza las columnas `id`, `name` y `abilities`. Cada fila genera pruebas por ID y nombre para PokéAPI, y una prueba por nombre para Wikipedia.

Las imágenes se descargan mediante elementos Web y se guardan en `images/`. La carpeta se crea automáticamente y un archivo con el mismo nombre se reemplaza.

## Autor

**Edwin Capcha**
