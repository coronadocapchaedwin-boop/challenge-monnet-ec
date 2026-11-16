# Monnet Payments - Performance con k6

Proyecto k6 para evaluar `POST /products/add` con 50 y 100 TPS durante 60 segundos.

## Estructura

```text
api/
  auth.js
  client.js
  products.js
config/
  endpoints.js
  environment.js
  load.js
scripts/
  executive-report.js
  run-all.js
  run.js
tests/
  products/
    create-product.test.js
utils/
  metrics.js
  report.js
reports/
  .gitkeep
.env.qa
.env.uat
README.md
PARTE-1.md
TEST-PLAN.md
```

`endpoints.js` centraliza las rutas. `client.js` ofrece `get()` y `post()`. Los archivos de recurso, como `products.js`, encapsulan operaciones reutilizables. El test conserva datos y validaciones; `load.js` define la carga.

## Instalación

Requiere Node.js 22 o posterior, npm y k6.

```bash
brew install k6
npm install
k6 version
```

Para otros sistemas operativos, instalar k6 siguiendo su documentación oficial.

## Ejecución

```bash
npm run test:product -- 10
npm run test:product -- 50
npm run test:product -- 100
npm test
npm run report
open reports/informe-ejecutivo.html
```

`test:product` acepta cualquier número de TPS y mantiene la duración de un minuto. `npm test` ejecuta los casos obligatorios de 50 y 100 TPS. `npm run report` genera el informe ejecutivo usando únicamente la ejecución más reciente.

Formato para una carga personalizada:

```text
npm run test:product -- <TPS>
```

Para otro ambiente:

```bash
ENV=uat npm run test:product -- 50
```

Para otro ambiente, crear `.env.<ambiente>` y usar su nombre en el mismo comando.
El test es `tests/products/create-product.test.js`; `config/load.js` aplica la tasa seleccionada durante un minuto.

## Flujo

1. El runner carga el archivo del ambiente y genera un identificador único.
2. `setup()` ejecuta `POST /auth/login` una vez y obtiene `accessToken`.
3. El JWT se comparte con todas las iteraciones.
4. Cada iteración genera un `title` único.
5. Cada iteración ejecuta un solo `POST /products/add`.
6. Se mide el porcentaje de HTTP 201 y se registran los HTTP 429 u otros estados.
7. La ejecución se interrumpe ante HTTP 429 y genera evidencia HTML/JSON.

## Agregar otro endpoint

1. Agregar la ruta en `config/endpoints.js`.
2. Crear la operación del recurso usando `get()` o `post()`.
3. Copiar un `.test.js`, cambiar la operación y el estado esperado.

Ejemplo de un recurso GET:

```javascript
import { get } from './client.js';
import { endpoints } from '../config/endpoints.js';

export function getProduct(token) {
  return get(endpoints.products.detail, token);
}
```

Test reutilizando esa operación:

```javascript
import { check } from 'k6';
import { getJwt } from '../../api/auth.js';
import { getProduct } from '../../api/products.js';
import { options } from '../../config/load.js';
import { recordOperation } from '../../utils/metrics.js';

export { options };
export { handleSummary } from '../../utils/report.js';

export function setup() {
  return { token: getJwt() };
}

export default function getProductTest({ token }) {
  const response = getProduct(token);
  check(response, { 'status 200': (r) => r.status === 200 });
  recordOperation(response, 200);
}
```

Registrar el nuevo test como un único script de npm y enviar los TPS después de `--`. La función `default` es el punto de entrada obligatorio de k6; asignarle un nombre, como `getProductTest`, facilita identificarla en logs y errores.

```json
"test:product-detail": "node scripts/run.js tests/products/get-product.test.js"
```

```bash
npm run test:product-detail -- 25
```

## Reportes

Cada ejecución genera dos archivos con el mismo identificador:

```text
reports/<run-id>-qa-products-create-product-50tps.html
reports/<run-id>-qa-products-create-product-50tps.json
```

Después de ejecutar ambos casos, se genera el reporte para negocio:

```text
reports/informe-ejecutivo.html
```

Generar y abrir específicamente el reporte ejecutivo:

```bash
npm run report
open reports/informe-ejecutivo.html
```

El reporte toma el último JSON generado, sin importar el TPS o la URL. Una nueva ejecución reemplaza el resultado anterior en el análisis ejecutivo.

Los archivos con fecha y TPS son reportes técnicos individuales. `informe-ejecutivo.html` es el reporte comparativo para personas no técnicas.

El HTML puede abrirse directamente en un navegador. El JSON conserva las métricas reales de k6. Una ejecución incompleta, interrumpida o sin métricas suficientes no se informa como exitosa.

Al terminar, la terminal muestra la ruta exacta del HTML:

```text
Reporte: reports/<run-id>-qa-products-create-product-50tps.html
```

En macOS se puede abrir con:

```bash
open reports/<nombre-del-reporte>.html
```

Para entregarlo como PDF, abrir el HTML y seleccionar **Imprimir → Guardar como PDF**. El archivo JSON con el mismo nombre conserva la evidencia técnica.

**Edwin Capcha**
