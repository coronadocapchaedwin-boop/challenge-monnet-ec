import { environment } from '../config/environment.js';
import { load } from '../config/load.js';

export function handleSummary(data) {
  const metrics = data.metrics || {};

  const attempts = metrics.operation_requests?.values?.count;
  const successRate = metrics.successful_requests?.values?.rate;
  const successful = metrics.successful_requests?.values?.passes;
  const iterations = metrics.iterations?.values?.count;
  const dropped = metrics.dropped_iterations?.values?.count;
  const limited = metrics.http_429?.values?.count;
  const unexpected = metrics.unexpected_status?.values?.count;
  const operationRate = metrics.operation_requests?.values?.rate;

  const duration = metrics.operation_duration?.values || {};

  const expected = load.expectedIterations;

  const thresholdResults = Object.values(metrics)
    .flatMap((metric) => Object.values(metric.thresholds || {}));

  const thresholdsPassed =
    thresholdResults.length >= 5 &&
    thresholdResults.every((item) => item.ok === true);

  const metricsAvailable = [
    attempts,
    successRate,
    successful,
    iterations,
    dropped,
    limited,
    unexpected,
  ].every(Number.isFinite);

  const complete =
    metricsAvailable &&
    attempts >= expected &&
    iterations >= expected &&
    dropped === 0;

  const passed =
    complete &&
    successRate === 1 &&
    limited === 0 &&
    unexpected === 0 &&
    thresholdsPassed;

  let status = 'NO CONCLUYENTE';
  let conclusion =
    'No existe evidencia suficiente para evaluar la carga.';

  if (limited > 0) {
    status = 'INTERRUMPIDA';
    conclusion =
      'El proveedor limitó las solicitudes con HTTP 429. ' +
      'No se pudo completar la carga solicitada.';
  } else if (metricsAvailable && !complete) {
    status = 'INCOMPLETA';
    conclusion =
      'No se completaron todas las operaciones programadas. ' +
      'No es posible confirmar la capacidad solicitada.';
  } else if (complete && !passed) {
    status = 'CON ERRORES';
    conclusion =
      'La carga se completó, pero se identificaron errores ' +
      'o incumplimientos técnicos.';
  } else if (passed) {
    status = 'COMPLETADA';
    conclusion =
      'Se completó la carga solicitada sin errores detectados. ' +
      'No se evaluó un SLA de latencia porque no fue proporcionado.';
  }

  const show = (value) =>
    Number.isFinite(value) ? String(value) : 'Sin datos';

  const ms = (value) =>
    Number.isFinite(value)
      ? `${value.toFixed(2)} ms`
      : 'Sin datos';

  const testName = __ENV.TEST_NAME || 'products-create-product';

  const runId =
    __ENV.RUN_ID ||
    new Date().toISOString().replace(/[:.]/g, '-');

  const filename =
    `${runId}-${environment.name}-${testName}-${load.tps}tps`;

  const rows = [
    ['Carga objetivo', `${load.tps} POST/s`],
    ['TPS obtenidos',
      Number.isFinite(operationRate)
        ? operationRate.toFixed(2)
        : 'Sin datos'],
    ['Duración programada', load.duration],
    ['Operaciones esperadas', expected],
    ['Operaciones evaluadas', show(attempts)],
    ['Iteraciones completadas', show(iterations)],
    ['Respuestas exitosas', show(successful)],
    ['Éxito (%)', Number.isFinite(successRate)
      ? `${(successRate * 100).toFixed(2)}%` : 'Sin datos'],
    ['Respuestas HTTP 429', show(limited)],
    ['HTTP 429 (%)', Number.isFinite(limited) && attempts > 0
      ? `${(limited / attempts * 100).toFixed(2)}%` : 'Sin datos'],
    ['Estados HTTP inesperados', show(unexpected)],
    ['Iteraciones omitidas', show(dropped)],
    ['Tiempo promedio', ms(duration.avg)],
    ['Tiempo p95', ms(duration['p(95)'])],
    ['Tiempo p99', ms(duration['p(99)'])],
    ['Tiempo máximo', ms(duration.max)],
  ];

  const table = rows.map(([name, value]) =>
    `<tr><th>${name}</th><td>${value}</td></tr>`
  ).join('');

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe de Performance</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background: #f4f6f8;
    color: #233044;
    margin: 0;
    padding: 30px;
  }
  main {
    max-width: 900px;
    margin: auto;
    padding: 32px;
    background: white;
    border-radius: 10px;
  }
  h1 { margin-bottom: 8px; }
  .meta { color: #607080; }
  .result {
    padding: 16px;
    background: #eef2f6;
    border-radius: 6px;
    margin: 24px 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  th, td {
    text-align: left;
    padding: 12px;
    border-bottom: 1px solid #dde3e9;
  }
  th { width: 55%; }
  .note { color: #607080; font-size: 14px; }
  @media print {
    body { background: white; padding: 0; }
    main { padding: 10px; }
  }
</style>
</head>
<body>
<main>
<h1>Informe de Performance</h1>
<p class="meta">E-commerce — Alta de productos</p>
<p class="meta">
  Ambiente: ${environment.name} |
  Prueba: ${testName}
</p>
<h2>Resultado: ${status}</h2>
<div class="result">${conclusion}</div>
<h2>Resultados obtenidos</h2>
<table>${table}</table>
<h2>Alcance y limitaciones</h2>
<p>
La prueba evalúa POST /products/add.
La autenticación se realiza antes de la carga.
Cada operación utiliza un título único.
</p>
<p>
DummyJSON simula la creación de productos.
Las métricas no demuestran la capacidad de un e-commerce real.
No se definió un SLA de latencia.
</p>
<p class="note">
Una ejecución incompleta o interrumpida no acredita
la capacidad de soportar los TPS solicitados.
</p>
<footer><strong>Edwin Capcha</strong></footer>
</main>
</body>
</html>`;

  const result = {
    runId,
    environment: environment.name,
    test: testName,
    targetTps: load.tps,
    duration: load.duration,
    expectedIterations: expected,
    status,
    conclusion,
    complete,
    passed,
    metrics: data.metrics,
    state: data.state,
  };

  return {
    stdout:
      `\n${testName}: ${status}\n${conclusion}\n` +
      `Reporte: reports/${filename}.html\n`,
    [`reports/${filename}.html`]: html,
    [`reports/${filename}.json`]:
      JSON.stringify(result, null, 2),
  };
}
