# Plan: Desarrollo screen-by-screen del frontend CoreBank

## Context

El proyecto es un frontend de homebanking (React 18 + TS + Vite) que actualmente tiene todas las páginas como **UI shells con datos hardcodeados** — sin llamadas a la API, sin autenticación, sin route guards. El backend (Spring Boot + JWT) ya está listo con endpoints definidos en `src/endpoints.json`. El objetivo es conectar cada pantalla al backend real, siguiendo un enfoque screen-by-screen, usando **Axios** para HTTP y **React Context + hooks** para estado global.

---

## Fase 0 — Infraestructura mínima (sin cambios de UI)

Antes de tocar cualquier pantalla, crear la base que todas necesitan.

**Instalar:** `npm install axios`

**Archivos nuevos:**

| Archivo | Propósito |
|---------|-----------|
| `src/types/api.ts` | Interfaces TS para todos los DTOs del backend (LoginResult, CustomerResult, AccountResult, TransactionResult, etc.) |
| `src/services/api.ts` | Instancia Axios con `baseURL: https://open-corebank.xyz/api/v1`, interceptor de request que adjunta JWT desde localStorage, interceptor de response que redirige a `/login` en 401 |
| `src/context/AuthContext.tsx` | Provider con: `token`, `user` (email, role, id), `customer` (CustomerResult), `isAuthenticated`, `isLoading` + métodos `login()`, `verify2FA()`, `logout()`, `setCustomer()`. Persiste token en localStorage, lee en mount |
| `src/components/shared/ProtectedRoute.tsx` | Componente que wrappea rutas protegidas: si no autenticado → redirect a `/login`, si loading → spinner |

**Modificar `src/App.tsx`:**
- Envolver con `<AuthProvider>`
- Agrupar rutas del dashboard bajo `<ProtectedRoute>` → `<DashboardLayout>`
- Ruta `/` redirige a `/login` si no autenticado, a `/dashboard` si autenticado

---

## Fase 1 — LoginPage (login + registro)

**Archivo nuevo:** `src/services/authService.ts` — wrappers para endpoints de auth

**Modificar `src/pages/LoginPage.tsx`:**
- **Tab Login:** `handleSubmit` llama a `POST /auth/login`
  - Si `requiresTwoFactor === true` → `navigate('/verify-2fa', { state: { sessionToken, maskedEmail, expirySeconds } })`
  - Si retorna `token` directo → guardar en context, navegar a `/loading`
  - Manejar errores: 401 (credenciales inválidas), 423 (usuario bloqueado)
- **Tab Sign Up:** Renderizar formulario de registro completo. `RegisterUserRequest` requiere: email, password, firstName, lastName, documentType, documentNumber, birthDate, phone, address, city, country. Al submit → `POST /auth/register` → navegar a `/confirm-account` con email en state
- Agregar estados `loading` y `error` para feedback visual

---

## Fase 2 — VerificationPage (2FA + confirmación de email)

**Modificar `src/pages/VerificationPage.tsx`:**
- **type="two-factor":** Leer `sessionToken`, `maskedEmail`, `expirySeconds` desde `useLocation().state` (reemplazar el hardcodeado). Submit llama `POST /auth/2fa/verify { sessionToken, code }`. Al éxito → guardar JWT en context → navegar a `/loading`. Agregar countdown timer con `expirySeconds`
- **type="account-confirmation":** El endpoint `POST /auth/verify-email` espera un `{ token }` (UUID del email, no un código de 6 dígitos). Cambiar UX: leer token de `?token=` query param, llamar al endpoint automáticamente al montar, mostrar estado success/error. Botón "Reenviar" llama `POST /auth/resend-verification { email }`
- Guard: si no hay state válido → redirect a `/login`

---

## Fase 3 — LoadingPage

**Archivo nuevo:** `src/services/customerService.ts` — `getMyCustomer()` wrapping `GET /customers/me`

**Modificar `src/pages/LoadingPage.tsx`:**
- On mount: llamar `customerService.getMyCustomer()`, guardar resultado en `AuthContext.setCustomer()`
- Mostrar `customer.firstName` real en vez del hardcodeado `'Alexander'`
- Navegar a `/dashboard` solo cuando: progreso llega a 100% AND fetch de customer completó
- Si falla el fetch → redirect a `/login`

---

## Fase 4 — DashboardPage + Layout components

**Archivos nuevos:**

| Archivo | Propósito |
|---------|-----------|
| `src/services/accountService.ts` | `getMyAccounts()`, `getAccountBalance(id)`, `searchByAlias(alias)` |
| `src/services/transactionService.ts` | `getMyTransactions(page, size)`, `getAccountTransactions(accountId, page, size)` |
| `src/hooks/useAccounts.ts` | Hook que retorna `{ accounts, isLoading, error, refetch }` |
| `src/hooks/useTransactions.ts` | Hook que retorna `{ transactions, pagination, isLoading, error }` |
| `src/utils/formatters.ts` | `formatCurrency(amount, currency)`, `formatDate(isoString)` |

**Modificar `src/pages/DashboardPage.tsx`:**
- Reemplazar arrays hardcodeados por `useAccounts()` y `useTransactions()`
- Mapear `AccountResult` → cards (tipo, últimos 4 dígitos de accountNumber, balance, currency)
- Mapear `TransactionResult` → filas de tabla
- "View All Transactions" → navegar a `/accounts`
- Monthly Spending: la API no tiene endpoint de agregación → dejar visual o calcular client-side desde transacciones
- Quick Transfer: mantener como shell por ahora, se conecta en Fase 7

**Modificar `src/components/layout/Header.tsx`:**
- Leer nombre de `useAuth().customer?.firstName` en vez del prop hardcodeado
- Conectar "Sign Out" a `AuthContext.logout()`

**Modificar `src/components/layout/Sidebar.tsx`:**
- Conectar "Sign Out" a `AuthContext.logout()`
- "Last Login" no tiene endpoint → dejar estático o remover

---

## Fase 5 — ProfilePage

**Archivo nuevo:** `src/components/shared/ProfileLayout.tsx` — extraer el sidebar duplicado entre ProfilePage y SecurityPage (~40 líneas idénticas). Lee nombre real del context, maneja sign-out.

**Extender** `src/services/customerService.ts`: agregar `updateMyCustomer(data)` → `PUT /customers/me`

**Modificar `src/pages/ProfilePage.tsx`:**
- Usar `ProfileLayout` en vez del sidebar inline
- Inicializar `formData` desde `useAuth().customer`
- Email desde `useAuth().user.email` (viene del LoginResult)
- `handleSubmit` → `customerService.updateMyCustomer(formData)` → actualizar context al éxito
- Cancel → resetear form a valores originales

---

## Fase 6 — SecurityPage

**Extender** `src/services/authService.ts`: agregar `changePassword()`, `get2FAStatus()`, `toggle2FA()`

**Modificar `src/pages/SecurityPage.tsx`:**
- Usar `ProfileLayout` en vez del sidebar inline
- On mount: `get2FAStatus()` para estado real del toggle 2FA
- Password change: validación client-side + `PUT /auth/change-password`
- 2FA toggle: `PUT /auth/2fa/toggle { enable }` — revertir toggle en error
- "Deactivate Account": no hay endpoint en la API → mostrar "Contacte soporte" o deshabilitar

---

## Fase 7 — TransfersPage (página nueva)

**Archivos nuevos:**

| Archivo | Propósito |
|---------|-----------|
| `src/pages/TransfersPage.tsx` | Formulario de transferencia multi-step |
| `src/services/transferService.ts` | `createTransfer()`, `getTransfer(id)` |

**Flujo multi-step:**
1. Seleccionar cuenta origen (dropdown de `useAccounts()`)
2. Destino: búsqueda por alias (`GET /accounts/search?alias=`) o número de cuenta (22 dígitos)
3. Monto, moneda, categoría (enum: FOOD, TRANSPORTATION, etc.), descripción
4. Pantalla de confirmación (generar `idempotencyKey` con `crypto.randomUUID()` aquí)
5. Submit `POST /transfers` → mostrar recibo o error

**Modificar `src/App.tsx`:** reemplazar ruta `/transfers` placeholder por `<TransfersPage />`

---

## Fase 8 — AccountsPage (página nueva)

**Archivo nuevo:** `src/pages/AccountsPage.tsx`

**Extender** `accountService.ts`: agregar `getAccount(id)`, `createAccount()`, `getAccountTypes()`

**Estructura:**
- Lista de cuentas del usuario con balance
- Al seleccionar cuenta → historial de transacciones paginado
- Botón "Crear cuenta" → modal con selección de tipo (`GET /accounts/types`) y moneda → `POST /accounts`

**Modificar `src/App.tsx`:** reemplazar ruta `/accounts` placeholder por `<AccountsPage />`

---

## Notas cross-cutting

- **CSS variables:** Antes de la Fase 4, extraer los colores hardcodeados (`#2563eb`, `#1d4ed8`, `#22c55e`, etc.) a CSS custom properties en `src/styles/index.css` bajo `:root`
- **Token storage:** localStorage (el backend usa `Authorization: Bearer`, no cookies)
- **Idempotency keys:** Todas las operaciones de dinero (deposit, withdrawal, transfer) requieren UUID — usar `crypto.randomUUID()`
- **Diseños Stitch:** Consultar via MCP al iniciar cada fase para alinear UI con los diseños

---

## Verificación

Para cada fase:
1. `npm run dev` — verificar que la app compila sin errores
2. `npm run build` — verificar que TypeScript pasa (strict mode con noUnusedLocals)
3. Testear el flujo manualmente contra el backend en `https://open-corebank.xyz/api/v1`
4. Verificar que rutas protegidas redirigen a `/login` sin token
5. Verificar que el token se persiste y sobrevive refresh de página
