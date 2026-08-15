# Tests del dominio de alert-rule

## Archivos de test (junto al código, patrón `megatone.scraper.spec.ts`)

1. `libs/shared/src/alert-rules/entities/alert-rule.entity.spec.ts`
2. `libs/shared/src/alert-rules/entities/notification-log.entity.spec.ts`
3. `libs/shared/src/alert-rules/alert-rules.service.spec.ts`
4. `libs/shared/src/alert-rules/notification-log.service.spec.ts`

## 1. `alert-rule.entity.spec.ts` (puro, sin Nest)

**`create`**
- Estado inicial `threshold_crossed`, `lastNotifiedPrice`/`lastNotifiedAt` null, `createdAt` seteado, id generado, `productId`/`priceSnapshotId` copiados.

**`fromPersistence`**
- Restaura estado y campos (incluye `state: 'notified'` y `'resolved'`).

**`notify`**
- Transición válida `threshold_crossed → notified`: setea `lastNotifiedPrice` y `lastNotifiedAt`.
- Lanza si el estado es `notified` o `resolved`.

**`resolve`**
- Válida `notified → resolved`.
- Lanza desde `threshold_crossed` y `resolved`.

**`reCross`**
- Válida `notified → threshold_crossed`.
- Lanza desde `threshold_crossed` y `resolved`.

**`canReCross`** (márgenes: 25h atrás = expirado, 1h atrás = no expirado)
- `lastNotifiedAt` null → falsy (null).
- Dentro de 24h → `false`.
- Pasado 24h → `true`.

## 2. `notification-log.entity.spec.ts`

- `create`: setea `id`/`alertId`/`triggerPrice`; `timestamp` default a `new Date()` si no se pasa y respeta el provisto.
- `fromPersistence`: restaura campos con `timestamp` requerido.

## 3. `alert-rules.service.spec.ts` — `handleEvaluationPrice`

- Mock del `IAlertRuleRepository` (jest.fn por método). Helpers: `makeProduct()`, `makeSnapshot()`, `makeAlert({state, lastNotifiedPrice, lastNotifiedAt})`.
- **Instanciación directa**: `new AlertRulesService(mockRepo)`.

Matriz de ramas:

| # | priceIsLow | estado activa | resultado esperado |
|---|-----------|---------------|--------------------|
| 1 | false | sin alerta | null |
| 2 | false | `threshold_crossed` | null |
| 3 | false | `notified` | `resolve()` + `repo.update` + null |
| 4 | false | `resolved` | null |
| 5 | true | sin alerta | crea y persiste (state `threshold_crossed`), retorna la alerta |
| 6 | true | `threshold_crossed` | retorna la activa, sin persistir |
| 7a | true | `notified`, precio mejoró (`snapshot.price < lastNotifiedPrice`) | `reCross()` + `update` |
| 7b | true | `notified`, no mejoró pero expiró (25h) | `reCross()` + `update` |
| 7c | true | `notified`, no mejoró y no expiró (1h) | null, sin `update` |
| 7d | true | `notified` con `lastNotifiedPrice` y `lastNotifiedAt` null | null (sin crash) |

También:
- `findById`: devuelve la alerta; lanza `Error('No existe una alerta con el ID ...')` si el repo devuelve null.
- `update`: delega en `repo.update`.

## 4. `notification-log.service.spec.ts` (incluido)

- Mock de `INotificationLogRepository` y del `Logger` de nestjs-pino (objeto `{ log: jest.fn() }`, casteado `as unknown as Logger`).
- **Instanciación directa**: `new NotificationLogService(mockRepo, mockLogger)`.
- `createAndLog`: llama `repo.create` con el log y devuelve lo creado; `logger.log` llamado con `{ alertId, triggerPrice }` y el mensaje conteniendo `productName`.

## Notas

- Comando: `pnpm test` o `pnpm test alert-rules`.
- `crypto.randomUUID` disponible en Node ≥18 (global).
- `canReCross`: márgenes 1h/25h sobre `Date.now()` (alternativa: `jest.useFakeTimers`).
- `findAll`/`delete` de la interfaz quedan fuera (no se usan en el dominio); quedan para tests del repositorio.