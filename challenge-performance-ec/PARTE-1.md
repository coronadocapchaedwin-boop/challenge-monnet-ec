# Parte 1 - Estrategia de performance para el e-commerce

Considerando 1500 ventas diarias y un incremento de hasta cinco veces en fechas especiales, las pruebas más oportunas son Load Test, Spike Test, Stress Test y Soak Test. En conjunto permiten validar la operación normal, el volumen esperado de campaña, los incrementos repentinos, el límite de capacidad y la estabilidad durante periodos prolongados.

| Prueba | Aplicación | Objetivo |
| --- | --- | --- |
| Load Test | Reproducir primero el tráfico normal y luego el volumen esperado de una fecha especial, hasta cinco veces el normal. | Establecer el baseline y verificar la capacidad prevista para Black Friday o Navidad. |
| Spike Test | Aumentar la carga desde el nivel normal hasta el pico en pocos segundos y luego reducirla. | Evaluar escalamiento, estabilidad y recuperación. |
| Stress Test | Incrementar la carga por etapas por encima del pico esperado. | Identificar degradación, límite de capacidad y comportamiento de recuperación. |
| Soak Test | Mantener una carga representativa durante varias horas. | Detectar degradación, fugas de memoria y agotamiento de conexiones. |

Antes de estas pruebas se debe ejecutar un smoke de carga mínima para comprobar el script, los datos y la observabilidad.

## Criterio para dimensionar la carga

```text
Operación normal: 1500 ventas por día
Fecha especial:   7500 ventas por día
Incremento:       5 veces el volumen normal
```

Las ventas son transacciones de negocio, no requests HTTP ni VUs. Para definir la carga técnica se necesitan datos de producción adicionales:

1. Ventas y sesiones de la hora pico.
2. Conversión de sesiones a ventas.
3. Distribución de tráfico entre búsqueda, catálogo, carrito y pago.
4. Requests ejecutados por cada flujo.
5. Duración de las iteraciones y tiempos de espera del usuario.
6. SLA o SLO de latencia, errores y disponibilidad.

No se convierten directamente las 1500 o 7500 ventas en TPS o VUs. Cualquier porcentaje de hora pico, cantidad de requests por compra o concurrencia sería un supuesto hasta contar con telemetría de producción.

Las tasas, etapas y duraciones definitivas deben obtenerse del patrón real del negocio. Esta parte selecciona y justifica las pruebas; no agrega escenarios ejecutables contra DummyJSON.

**Edwin Capcha**
