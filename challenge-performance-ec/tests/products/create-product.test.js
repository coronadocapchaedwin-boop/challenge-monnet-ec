import { check } from 'k6';
import exec from 'k6/execution';

import { getJwt } from '../../api/auth.js';
import { createProduct } from '../../api/products.js';
import { options } from '../../config/load.js';
import { recordOperation } from '../../utils/metrics.js';

export { options };
export { handleSummary } from '../../utils/report.js';

// ARRANGE: obtener una vez el JWT para toda la carga.
export function setup() {
  return {
    runId: Date.now(),
    token: getJwt(),
  };
}

export default function createProductTest({ token, runId }) {
  // ARRANGE: generar un título único por solicitud.
  const payload = {
    title: `monnet-${runId}-${exec.scenario.iterationInTest}`,
    price: 1.23,
  };

  // ACT: crear el producto.
  const response = createProduct(payload, token);

  // ASSERT: 201 es éxito; 429 se registra y detiene la carga.
  check(response, {
    'status 201': (r) => r.status === 201,
  });

  recordOperation(response, 201);

  if (response.status === 429) {
    exec.test.abort('HTTP 429: provider rate limit');
  }
}
