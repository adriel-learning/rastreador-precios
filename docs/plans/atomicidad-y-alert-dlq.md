# Atomicidad en price-check + DLQ de ALERT_QUEUE

## Contexto / decisiones previas

- Punto 7 (errores de dominio vs HTTP): descartado, no habrá controller de alert-rules, `new Error` está bien.
- Punto 8 (dead code): ya resuelto por el usuario.
- Punto 1 (migraciones): ya existen en la DB, no tocar.

## A. Atomicidad en el flujo de price-check

**Problema**: `PriceCheckerService.execute` hace escrituras no atómicas: snapshot → update product → create/update alerta (+ enqueue a BullMQ).

**Solución propuesta**:
1. `DbService` expone `transaction<T>(fn: (tx) => Promise<T>)` (drizzle `db.transaction`).
2. Los repos aceptan un parámetro opcional `db` (default `this.dbService.db`) tipado para soportar `NodePgDatabase | transacción`, permitiendo ejecutarse dentro de la misma transacción.
3. `PriceCheckerService` orquesta dentro de `db.transaction(...)`: crear snapshot + actualizar product + manejar alerta.
4. El enqueue a `ALERT_QUEUE` queda **fuera** de la transacción (Redis ≠ PG). Si falla, el próximo scrape (30s) re-evalúa y re-encola → consistencia eventual.

**Detalles a resolver en implementación**:
- Tipo exacto de drizzle para el parámetro `db` de los repos (`NodePgDatabase` / `PgTransaction`).
- Qué métodos de repo participan: `PriceSnapshotRepository.create`, `ProductRepository.findById` (lectura) + `update`, y `AlertRulesService.handleEvaluationPrice` (que internamente crea/actualiza alerta).

## B. DLQ de ALERT_QUEUE

Espeja el patrón existente de check-price.

1. **Contract** (`libs/shared/src/queues/alert-notification.contract.ts`):
   - `ALERT_DLQ = 'alert-dead-letter-queue'`, `ALERT_DLQ_JOB`.
   - `interface AlertDlqContract { originalJobId: string; data: AlertContract; error: string }`.
2. **Worker** (`apps/worker/src/alert-notification/`):
   - Registrar cola `ALERT_DLQ` en `alert-notification.module.ts` (BullModule.registerQueue).
   - Nuevo `AlertDlqProcessor` (`@Processor(ALERT_DLQ)`) que loguea con Pino (`Logger` inyectado) el `job.data` y el error.
3. **Producer** (`price-evaluation.service.ts:47`):
   - Agregar `opts` al `alertQueue.add(...)`: `{ attempts: 3, backoff: { delay: 5000, type: 'exponential' } }` (igual que check-price).
   - Agregar `@OnWorkerEvent('failed')` en `AlertProcessor` para mover a DLQ cuando se agotan los attempts (patrón de `CheckPriceProcessor.onFailed`).
4. **⚠️ Idempotencia** (decisión a confirmar antes de implementar):
   - Hoy `AlertProcessor.process` hace `alert.notify(...)`. Si el job se reintenta tras notificar, `notify()` lanza (estado ya `notified`) → el job cae a DLQ aunque la notificación original fue exitosa.
   - **Opción A (mínima)**: DLQ solo para observabilidad, sin reintentos (1 attempt).
   - **Opción B (con reintentos)**: hacer el processor idempotente (si ya está `notified`, no re-notificar), pensando en futuros emails.