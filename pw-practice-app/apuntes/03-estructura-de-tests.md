# 📚 Estructura de Tests y Conceptos Básicos

## Estructura de Tests

### Test Individual
Para ejecutar un test individual, usa la función `test()`:

```typescript
import {test} from '@playwright/test';

test('the first test', async({page}) => {
    await page.goto('http://localhost:4200/')
    // ... más acciones
})
```

---

### Suite de Tests
Para agrupar tests relacionados, usa `test.describe()`:

```typescript
import {test} from '@playwright/test';

test.describe('test suite one', () => {
    test('the first test', async({page}) => {
        await page.goto('http://localhost:4200/')
    })
    
    test('the second test', async({page}) => {
        await page.goto('http://localhost:4200/forms')
    })
})
```

---

### beforeEach - Hooks de Preparación

El hook `beforeEach` ejecuta código **antes de cada test**. Es útil para evitar repetir código común.

#### beforeEach Global
Se ejecuta antes de **todos los tests** del archivo:

```typescript
test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:4200/')
})

test('the first test', async ({page}) => {
    // La página ya está en localhost:4200
    await page.getByText('Forms').click()
})

test('the second test', async ({page}) => {
    // También empieza en localhost:4200
    await page.getByText('Charts').click()
})
```

#### beforeEach en una Suite
Se ejecuta antes de cada test **dentro de esa suite específica**:

```typescript
test.beforeEach(async ({page}) => {
    await page.goto('http://localhost:4200/')  // Global: para todos los tests
})

test.describe('Forms suite', () => {
    test.beforeEach(async({page}) => {
        await page.getByText('Forms').click()  // Solo para tests de esta suite
    })

    test('navigate to form layouts', async ({page}) => {
        await page.getByText('Form Layouts').click()
    })
    
    test('navigate to datepicker', async({page}) => {
        await page.getByText('Datepicker').click()
    })
})

test.describe('Charts suite', () => {
    test.beforeEach(async({page}) => {
        await page.getByText('Charts').click()  // Solo para tests de esta suite
    })

    test('navigate to echarts', async ({page}) => {
        await page.getByText('Echarts').click()
    })
})
```

**Orden de ejecución:**
1. `beforeEach` global (si existe)
2. `beforeEach` de la suite (si existe)
3. El test individual

**Ventajas:**
- ✅ Evita duplicar código
- ✅ Hace los tests más legibles
- ✅ Facilita el mantenimiento
- ✅ Configura estado común para múltiples tests

---

## Promesas y async/await en Playwright

### ¿Por qué necesitamos async/await?

**Las operaciones de Playwright son asíncronas** y retornan Promesas. Esto significa que no se ejecutan inmediatamente, sino que toman tiempo en completarse.

---

### Cómo saber cuándo usar await

Haz **hover** sobre el método en VS Code:
- Si retorna `Promise<...>` → **Necesitas usar `await`**
- Si NO retorna Promise → **No necesitas `await`**

---

### Ejemplos:

```typescript
// ✅ Necesitan await (retornan Promise)
await page.goto()     // Promise<Response | null>
await page.click()    // Promise<void>
await page.fill()     // Promise<void>
await page.waitFor()  // Promise<void>

// ❌ NO necesitan await (no retornan Promise)
page.locator()        // Locator
page.getByRole()      // Locator
```

---

### Sin await vs Con await

**Sin await (FALLO ❌):**
```typescript
test('sin await', ({page}) => {
    page.goto('http://localhost:4200/') // ❌ No espera
    // El test termina ANTES de que la página cargue
})
```

**Con await (ÉXITO ✅):**
```typescript
test('con await', async({page}) => {
    await page.goto('http://localhost:4200/') // ✅ Espera a que termine
    // El test continúa después de que la página cargue completamente
})
```

---

### Regla práctica:
- Si el método **hace una acción** (navegar, hacer click, escribir, esperar) → **usa `await`**
- Si el método **solo crea un localizador** → **NO uses `await`**

El `await` le dice a Playwright: **"Para aquí y espera hasta que esta operación termine completamente antes de continuar."**

---

[⬅️ Anterior: Ejecución de Tests](02-ejecucion-de-tests.md) | [Volver al índice](README.md) | [Siguiente: Selectores y Acciones ➡️](04-selectores-assertions-acciones.md)
