# Parte 2 - Plan de pruebas del endpoint de productos

## Objetivo

Evaluar `POST /products/add` con las tasas y duración indicadas por el challenge.

## Casos de prueba

| ID | Caso | Tasa | Duración | Operaciones programadas | VUs iniciales estimados |
| --- | --- | ---: | ---: | ---: | ---: |
| PERF-001 | Alta de productos a 50 TPS | 50 POST/s | 60 segundos | 3000 | 50 |
| PERF-002 | Alta de productos a 100 TPS | 100 POST/s | 60 segundos | 6000 | 100 |

Ambos casos reutilizan `tests/products/create-product.test.js`. El archivo define el endpoint, payload y validaciones; la tasa se entrega como parámetro. Cada caso genera sus propios reportes HTML y JSON.

Se reserva un VU por TPS como capacidad inicial simple. El criterio ejecutado continúa siendo la tasa; si la capacidad no alcanza, k6 registra `dropped_iterations`.

## Modelo de carga

Se utiliza `constant-arrival-rate`: la ejecución se configura por TPS y k6 usa los VUs preasignados para sostener esa tasa. Los VUs no reemplazan los TPS; son la capacidad de concurrencia del generador. Si no alcanzan, k6 registra `dropped_iterations`.

## Preparación común

Antes de PERF-001 y PERF-002, `setup()` ejecuta una vez `POST /auth/login`, obtiene `accessToken` y lo comparte con las iteraciones. El login no se contabiliza como operación de producto.

## Flujo de cada caso

1. Cargar el ambiente y generar el identificador de ejecución.
2. Autenticar una vez en `setup()`, obtener el JWT y reutilizarlo.
3. Crear un `title` único y el body con `price` numérico.
4. Ejecutar un `POST /products/add` por iteración con JWT y JSON.
5. Validar HTTP 201 y registrar HTTP 201, 429 y otros estados sin contar el login.
6. Interrumpir ante HTTP 429 o generar el HTML y JSON con el mismo identificador.

## Cobertura funcional y técnica

| Requisito | Cobertura |
| --- | --- |
| Generar y obtener JWT | `getJwt()` desde `setup()`. |
| Reutilizar JWT | Token compartido con todas las iteraciones. |
| Header Authorization | `Bearer <token>` enviado por el cliente. |
| Content-Type | `application/json` enviado por el cliente. |
| Body requerido | `title` único y `price` numérico. |
| Validar respuesta | HTTP 201 esperado; HTTP 429 y otros estados registrados. |
| 50 y 100 TPS | PERF-001 y PERF-002 durante 60 segundos. |
| HTTP 429 | Registro en `http_429` e interrupción de la prueba. |
| Evidencia | Reporte HTML y JSON por ejecución. |

## Métricas

- **Carga:** TPS objetivo y obtenido, operaciones esperadas/evaluadas e iteraciones completadas.
- **Resultado HTTP:** cantidad y porcentaje de 201, cantidad de 429 y otros estados.
- **Integridad:** `dropped_iterations` para detectar carga no iniciada.
- **Latencia:** p95 como indicador principal; promedio, p99 y máximo como diagnóstico.

El p95 indica el tiempo máximo del 95% de las operaciones y el p99 ayuda a identificar la cola lenta. No se usan como criterios de aprobación porque el challenge no proporciona un SLA; se comparan entre 50 y 100 TPS.

## Criterios de completitud y resultado

| Estado | Criterio |
| --- | --- |
| `COMPLETADA` | Alcanza 3000/6000 operaciones e iteraciones, sin drops, errores, 429 ni thresholds fallidos. |
| `CON ERRORES` | Completa la carga, pero falla una validación o threshold. |
| `INCOMPLETA` | No alcanza las operaciones o iteraciones programadas. |
| `INTERRUMPIDA` | El proveedor responde HTTP 429. |
| `NO CONCLUYENTE` | Faltan métricas críticas para evaluar la ejecución. |

Una operación solo cuenta cuando fue evaluada y registrada. La latencia se informa sin criterio de aprobación porque no existe un SLA proporcionado.

## Ejecución

1. Instalar dependencias y comprobar k6.
2. Ejecutar 50 TPS, 100 TPS o ambos.
3. Revisar el estado en terminal, abrir el HTML y conservar el JSON asociado.

```bash
npm run test:50
npm run test:100
```

Ejecutar ambos casos secuencialmente:

```bash
npm test
```

Las pruebas se ejecutan secuencialmente. Una respuesta HTTP 429 indica que la carga no se completó y no acredita capacidad para sostener los TPS solicitados.

## Reporte y evidencia

Cada ejecución genera un HTML ejecutivo y un JSON. El HTML prioriza TPS, operaciones, porcentaje HTTP 201, HTTP 429, iteraciones omitidas y p95; conserva promedio, p99 y máximo como diagnóstico.

El formato elegido para la entrega es HTML porque puede abrirse directamente sin servidor ni dependencias. Si se requiere PDF, se abre el HTML en el navegador y se utiliza **Imprimir → Guardar como PDF**. No es necesario generar PPT y PDF adicionalmente porque el challenge permite cualquier formato.

**Edwin Capcha**
