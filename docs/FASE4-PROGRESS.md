# Fase 4 — DashboardPage + Layout Components — Progreso

## Estado: COMPLETADA

---

## Archivos creados

### 1. `src/services/accountService.ts`
- `getMyAccounts()` → `GET /accounts/me` → `AccountResult[]`
- `getAccountBalance(id)` → `GET /accounts/me/{id}/balance` → `AccountBalanceResult`
- `searchByAlias(alias)` → `GET /accounts/search?alias=` → `AccountPublicResult`

### 2. `src/services/transactionService.ts`
- `getMyTransactions(page, size)` → `GET /transactions/me?page=&size=` → `PagedResult<TransactionResult>`
- `getAccountTransactions(accountId, page, size)` → `GET /transactions/accounts/{id}?page=&size=` → `PagedResult<TransactionResult>`

### 3. `src/hooks/useAccounts.ts`
- Patrón: `useState` + `useEffect` + `useCallback`
- Retorna `{ accounts, isLoading, error, refetch }`
- Llama `accountService.getMyAccounts()` on mount

### 4. `src/hooks/useTransactions.ts`
- Acepta `page` y `size` como parámetros (defaults: 0, 5)
- Retorna `{ transactions, pagination, isLoading, error }`
- Incluye cleanup con `cancelled` flag para evitar updates en componentes desmontados

### 5. `src/utils/formatters.ts`
- `formatCurrency(amount, currency)` → USD usa `Intl.NumberFormat` con style currency, otras monedas muestran `"ARS 12,800.00"`
- `formatDate(isoString)` → `"Oct 05, 2023"` (en-US, month short)
- `formatTime(isoString)` → `"02:15 PM"` (en-US, 12h)

---

## Archivos modificados

### 6. `src/pages/DashboardPage.tsx`
**Cambios principales:**
- Eliminados todos los arrays hardcodeados (`accounts`, `transactions`, `spendingCategories` parcial, `quickTransferContacts` se mantiene como shell)
- Usa `useAccounts()` y `useTransactions(0, 5)` hooks
- Mapeo de `AccountResult` → cards con icono según `accountType`:
  - `CHECKING` → Wallet (azul), `SAVINGS` → PiggyBank (verde), `INVESTMENT` → TrendingUp (violeta)
  - Muestra `**** {accountNumber.slice(-4)}` y `formatCurrency(balance, currency)`
  - Actions: "Transfer" / "Details"
- Mapeo de `TransactionResult` → filas de tabla:
  - `formatDate(executedAt)` + `formatTime(executedAt)`
  - `description` como texto del merchant
  - `status` como badge con color dinámico (COMPLETED=verde, PENDING=amarillo, FAILED=rojo)
  - `amount` con signo según `transactionType` (CREDIT=+positivo, DEBIT/FEE=-negativo)
- Se eliminó la columna CATEGORY de la tabla (no existe en `TransactionResult`)
- "View All Transactions" → `navigate('/accounts')`
- **Empty states mejorados:**
  - Accounts vacías: card con icono `CreditCard`, título, descripción y botón "Create Account" → `/accounts`
  - Transactions vacías: bloque centrado con icono `Receipt`, título y descripción
  - Loading states: spinner `Loader2` animado centrado en la card
- **Card "Open New Account":** card con borde dashed que aparece junto a las cuentas existentes, con icono `+`, label y hint. Navega a `/accounts`. Se muestra solo cuando ya hay cuentas (cuando no hay, el empty state ya tiene el CTA).
- Monthly Spending → se mantiene como visual placeholder (no hay endpoint de agregación)
- Quick Transfer → se mantiene como shell (se conecta en Fase 7)

### 7. `src/components/layout/Header.tsx`
**Cambios principales:**
- Eliminado `interface HeaderProps` y prop `userName`
- Usa `useAuth()` → `customer?.firstName` como display name (fallback: `user?.email`, luego `'User'`)
- Avatar seed dinámico: `${customer.firstName}-${customer.lastName}` en vez de hardcodeado "Alex"
- Email real en dropdown desde `user?.email`
- "Sign Out" ejecuta `auth.logout()` directamente (que limpia localStorage y redirige) en vez de `navigate('/login')`

### 8. `src/components/layout/Sidebar.tsx`
- Sin cambios — no tiene logout ni datos dinámicos relevantes. "Last Login" queda estático.

---

## CSS agregado en `src/styles/DashboardPage.css`
- `.loading-card` — card de loading centrada con spinner
- `.empty-state-card`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-description`, `.empty-state-btn` — sistema de empty states reutilizable
- `.create-account-card`, `.create-account-content`, `.create-account-icon`, `.create-account-label`, `.create-account-hint` — card de acceso rápido a crear cuenta
- `.transactions-empty-state` — empty state específico para la tabla de transacciones
- `.spinner` + `@keyframes spin` — animación de loading
- Grid de tabla ajustado de 5 a 4 columnas (se eliminó CATEGORY)

---

## Tipos reutilizados de `src/types/api.ts`
- `AccountResult`, `AccountBalanceResult`, `AccountPublicResult`, `AccountType`
- `TransactionResult`, `PagedResult<T>`

## Dependencias existentes usadas
- `src/services/api.ts` — instancia Axios con interceptors (token + 401 redirect)
- `useAuth()` — de `src/context/AuthContext.tsx`

---

## Verificación
- `npm run build` pasa sin errores TypeScript (strict mode + noUnusedLocals)
- No se introdujeron dependencias nuevas

---

## Siguiente: Fase 5 — ProfilePage
Según `PLAN.md`:
- Crear `src/components/shared/ProfileLayout.tsx` (extraer sidebar duplicado entre Profile y Security)
- Extender `customerService.ts` con `updateMyCustomer()`
- Conectar `ProfilePage` a datos reales del context y API
