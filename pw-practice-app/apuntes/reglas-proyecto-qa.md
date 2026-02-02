# 📋 Reglas del Proyecto - Guía de Testing QA

## Resumen enfocado para QA manual con Playwright

---

## 1️⃣ E2E / Playwright

### Ubicación de tests:
```
e2e/specs/feature-name.spec.ts
```

### Page Object Model (POM):
Separar la lógica de interacción de la página de la lógica del test.

**Ejemplos de funciones que ya existen en `e2e/pages/`:**
- `fillDealForm()`
- `clickSubmit()`
- `openDealModal()`

**Objetivo:** hacer los tests legibles y fáciles de mantener.

---

### Login / Auth:
Evitar repetir login en cada test.

Se usa `storageState` (`e2e/.auth/user.json`) para guardar cookies y localStorage y reutilizarlo.

**Ejemplo global-setup:**

```typescript
import { chromium } from '@playwright/test';

async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(process.env.BASE_URL + '/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  await browser.close();
}
export default globalSetup;
```

---

## 2️⃣ Cómo interactuar con la UI (Selectors A11y-first)

### Prioridad de selección de elementos:

#### 1. `getByRole` → botones, encabezados, etc.
```typescript
await page.getByRole('button', { name: /create deal/i }).click();
```

#### 2. `getByLabel` → campos de formulario.
```typescript
await page.getByLabel('Deal name').fill('Nuevo Deal');
```

#### 3. `getByText` → mensajes visibles, confirmaciones.

#### 4. `getByTestId` → solo si el elemento es dinámico o muy complejo.

---

### Ejemplo listas dinámicas:
```typescript
const row = page.getByTestId(`file-row-${fileId}`);
await row.getByRole('button', { name: /download/i }).click();
```

---

### Reglas de data-testid:
- **Kebab-case**, máximo 4 segmentos
- `feature/component/element/qualifier` si aplica
- **Última opción** si no hay otra manera de seleccionar el elemento

---

## 3️⃣ Qué flujos se esperan que automatices

### Flujos críticos de usuario que antes probabas manualmente:

- ✅ Login / Logout
- ✅ Crear deals / forms
- ✅ Subir o descargar archivos
- ✅ Validaciones de formularios (errores, campos obligatorios)
- ✅ Navegación entre pantallas
- ✅ Flujos que se usan en la app constantemente

**No necesitas tocar backend ni mocks complejos.** Tu objetivo es replicar los pasos manuales pero de manera automática.

---

## 4️⃣ Test Execution / Contexto

### Cuándo ejecutar:

- **Tests locales** → rápido, mientras desarrollas
- **CI/CD** → después de merge o nightly, para verificar que los flujos críticos funcionan

### Objetivo:

- Detectar problemas que un usuario real encontraría
- Validar que la app funciona tal como se espera, no que el código esté correcto internamente

---

## 5️⃣ Resumen de buenas prácticas para ti

✅ **Reutiliza Page Objects existentes**

✅ **Usa selectors accesibles** (`getByRole`, `getByLabel`) siempre que sea posible

✅ **Evita login repetido** → usa `storageState`

✅ **Automatiza flujos que antes probabas manualmente**, no funciones internas del backend

✅ **Documenta errores** o pasos que fallen, toma screenshots si es necesario

✅ **No necesitas configurar mocks ni tests unitarios**; céntrate en lo que ve y hace el usuario
