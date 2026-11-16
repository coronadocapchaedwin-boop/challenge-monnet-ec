import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';

const reports = readdirSync('reports')
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    result: JSON.parse(readFileSync(`reports/${file}`, 'utf8')),
    modified: statSync(`reports/${file}`).mtimeMs,
  }));

const results = [reports.toSorted((a, b) => b.modified - a.modified)[0].result];

const value = (result, metric, field) =>
  result.metrics[metric]?.values?.[field] ?? 0;

const successMetric = (result) =>
  result.metrics.successful_requests ? 'successful_requests' : 'http_201';

const passed = (result) => {
  const attempts = value(result, 'operation_requests', 'count');
  const successRate = value(result, successMetric(result), 'rate');
  const limited = value(result, 'http_429', 'count');
  const unexpected = value(result, 'unexpected_status', 'count');
  const dropped = value(result, 'dropped_iterations', 'count');

  return attempts >= result.expectedIterations &&
    successRate === 1 && limited === 0 && unexpected === 0 && dropped === 0;
};

const rows = results.map((result) => {
  const attempts = value(result, 'operation_requests', 'count');
  const successes = value(result, successMetric(result), 'passes');
  const successRate = value(result, successMetric(result), 'rate') * 100;
  const limited = value(result, 'http_429', 'count');
  const p95 = value(result, 'operation_duration', 'p(95)');
  const scheduledSeconds = result.expectedIterations / result.targetTps;
  const achievedTps = attempts >= result.expectedIterations
    ? attempts / scheduledSeconds
    : value(result, 'operation_requests', 'rate');
  const outcome = limited > 0
    ? 'No concluido: límite del proveedor'
    : passed(result) ? 'Objetivo cumplido' : 'Objetivo no cumplido';

  return `<tr>
    <td>${result.targetTps} TPS</td>
    <td>${achievedTps.toFixed(2)} TPS</td>
    <td>${result.expectedIterations}</td>
    <td>${attempts}</td>
    <td>${successes} (${successRate.toFixed(2)}%)</td>
    <td>${limited}</td>
    <td>${p95.toFixed(2)} ms</td>
    <td>${outcome}</td>
  </tr>`;
}).join('');

const hasRateLimit = results.some((result) =>
  value(result, 'http_429', 'count') > 0
);
const allPassed = results.every(passed);
const loads = results.map((result) => `${result.targetTps} TPS`).join(' y ');
const objective = results
  .map((result) => `${result.targetTps} TPS (${result.expectedIterations} operaciones)`)
  .join(' y ');

const conclusion = allPassed
  ? `La ejecución de ${loads} completó la carga programada con 100% de
     respuestas exitosas y sin rechazos del proveedor.`
  : hasRateLimit
  ? `No fue posible certificar ${loads} durante un minuto. El servicio público
     rechazó solicitudes por límite de uso y las pruebas se detuvieron para evitar
     tráfico innecesario. Este resultado evidencia una restricción del proveedor,
     pero no demuestra por sí solo el límite técnico de una aplicación real.`
  : `La carga de ${loads} no cumplió todos los criterios esperados. Se requiere
     revisar los resultados antes de aprobar la capacidad evaluada.`;

const recommendation = allPassed
  ? `Conservar este resultado como línea base y repetirlo después de cambios
     relevantes en la aplicación o infraestructura.`
  : hasRateLimit
  ? `No aprobar todavía la capacidad de ${loads}. Repetir las pruebas en un
     ambiente controlado o con el límite del proveedor habilitado para la carga
     requerida.`
  : `Corregir los errores observados y repetir la misma carga antes de aprobarla.`;

const impact = allPassed
  ? `La carga evaluada fue atendida sin rechazos. El resultado corresponde al
     ambiente y endpoint ejecutados y no debe extrapolarse a una carga mayor.`
  : `Bajo la carga evaluada podrían rechazarse altas de productos. Como DummyJSON
     es un servicio público de simulación, el resultado no debe extrapolarse
     directamente a producción.`;

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe ejecutivo de performance</title>
<style>
  body { font-family: Arial, sans-serif; margin: 0; padding: 30px; color: #233044; background: #f4f6f8; }
  main { max-width: 1050px; margin: auto; padding: 32px; background: white; border-radius: 10px; }
  h1 { margin-bottom: 6px; }
  .meta { color: #607080; }
  .summary { padding: 18px; margin: 22px 0; background: #fff4e5; border-left: 5px solid #e58b18; }
  table { width: 100%; border-collapse: collapse; margin: 22px 0; }
  th, td { padding: 11px; border-bottom: 1px solid #dde3e9; text-align: left; }
  th { background: #eef2f6; }
  .note { color: #607080; font-size: 14px; }
  @media print { body { background: white; padding: 0; } main { padding: 10px; } }
</style>
</head>
<body>
<main>
  <h1>Informe ejecutivo de performance</h1>
  <p class="meta">Alta de productos — Ambiente ${results[0].environment.toUpperCase()}</p>

  <h2>Objetivo esperado</h2>
  <p>Procesar ${objective} durante un minuto, con 100% de respuestas HTTP 201 y sin rechazos HTTP 429.</p>

  <h2>Conclusión ejecutiva</h2>
  <div class="summary">${conclusion}</div>

  <h2>Resultados</h2>
  <table>
    <thead><tr><th>Carga objetivo</th><th>Carga obtenida</th><th>Esperadas</th><th>Evaluadas</th><th>Exitosas</th><th>Rechazadas</th><th>95% respondió en</th><th>Resultado</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <h2>Impacto para el negocio</h2>
  <p>${impact}</p>

  <h2>Recomendación</h2>
  <p>${recommendation}</p>

  <p class="note">El tiempo “95% respondió en” indica que el 95% de las solicitudes evaluadas respondió en ese tiempo o menos. El challenge no proporciona un SLA para aprobar la latencia.</p>
  <footer><strong>Edwin Capcha</strong></footer>
</main>
</body>
</html>`;

writeFileSync('reports/informe-ejecutivo.html', html);
console.log('Reporte ejecutivo: reports/informe-ejecutivo.html');
