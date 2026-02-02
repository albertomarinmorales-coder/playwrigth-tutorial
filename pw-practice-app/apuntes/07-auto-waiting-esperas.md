# ⏳ Auto Waiting y Esperas en Playwright

## ¿Qué es Auto Waiting?

Playwright **espera automáticamente** a que los elementos estén listos antes de interactuar con ellos.

### Esperas automáticas incluidas:

- ✅ Elemento existe en el DOM
- ✅ Elemento es visible
- ✅ Elemento está habilitado (no disabled)
- ✅ Elemento no está cubierto por otro elemento
- ✅ Elemento recibe eventos (no está en transición)

**Timeout por defecto:** 30 segundos (configurable)

---

## Auto Waiting con Assertions

### ✅ Forma recomendada - Con expect()

```typescript
const successButton = page.locator('.bg-success')

// Espera automática hasta 30s (o el timeout configurado)
await expect(successButton).toHaveText('Data loaded with AJAX get request.')
```

**Ventajas:**
- Espera inteligente automática
- Valida el resultado
- Error claro si falla

---

### Cambiar el timeout de una assertion específica

```typescript
// Esperar hasta 16 segundos para este assertion específico
await expect(successButton).toHaveText('Data loaded with AJAX get request.', {
    timeout: 16000
})
```

---

## Esperas Manuales (Alternative Waits)

Cuando necesitas control más específico sobre las esperas:

### 1. `waitFor()` - Esperar estado de un elemento

```typescript
const successButton = page.locator('.bg-success')

// Esperar a que el elemento esté "attached" (existe en el DOM)
await successButton.waitFor({ state: "attached" })

// Luego extraer el contenido
const text = await successButton.allTextContents()
```

**Estados disponibles:**
- `attached` - Elemento existe en el DOM
- `detached` - Elemento NO existe en el DOM
- `visible` - Elemento es visible
- `hidden` - Elemento está oculto

---

### 2. `waitForSelector()` - Esperar a que un selector aparezca

```typescript
// Espera a que aparezca el elemento con clase .bg-success
await page.waitForSelector('.bg-success')

const text = await successButton.allTextContents()
```

**Uso:** Cuando necesitas asegurar que un elemento existe antes de continuar.

---

### 3. `waitForResponse()` - Esperar una respuesta HTTP específica

```typescript
// Espera a que se complete una llamada HTTP específica
await page.waitForResponse('http://uitestingplayground.com/ajaxdata')

const text = await successButton.allTextContents()
```

**Uso:** Útil para esperar que termine una llamada AJAX/API específica.

---

### 4. `waitForLoadState()` - Esperar carga completa de la página

```typescript
// ⚠️ NO RECOMENDADO - Espera a que NO haya actividad de red
await page.waitForLoadState('networkidle')
```

**Estados disponibles:**
- `load` - Evento 'load' disparado
- `domcontentloaded` - Evento 'DOMContentLoaded' disparado
- `networkidle` - No hay conexiones de red por al menos 500ms

**⚠️ Advertencia sobre `networkidle`:**
- NO es confiable
- Puede causar flakiness (tests intermitentes)
- Evitar usarlo cuando sea posible
- Mejor usar `waitForResponse()` o assertions específicas

---

## Métodos de Extracción de Texto

### `textContent()` vs `allTextContents()`

```typescript
const element = page.locator('.item')

// textContent() - Texto del PRIMER elemento encontrado
const singleText = await element.textContent()

// allTextContents() - Array con TODOS los textos de elementos que coincidan
const allTexts = await element.allTextContents()
// Ejemplo resultado: ['Text 1', 'Text 2', 'Text 3']
```

---

## Comparación de Estrategias de Espera

| Método | Cuándo usar | Recomendado |
|--------|-------------|-------------|
| `expect().toHaveText()` | Validar texto después de carga | ✅ SÍ |
| `expect().toBeVisible()` | Validar visibilidad | ✅ SÍ |
| `waitFor({state})` | Control específico de estado | ✅ SÍ |
| `waitForSelector()` | Esperar elemento específico | ✅ SÍ |
| `waitForResponse()` | Esperar llamada API | ✅ SÍ |
| `waitForLoadState('load')` | Esperar carga básica | ⚠️ A veces |
| `waitForLoadState('networkidle')` | Esperar red inactiva | ❌ NO |
| `waitForTimeout()` | Tiempo fijo | ❌ NO |

---

## Ejemplo Completo - Auto Waiting con AJAX

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('http://uitestingplayground.com/ajax')
    await page.getByText('Button Triggering AJAX Request').click()
})

test('auto waiting', async ({ page }) => {
    const successButton = page.locator('.bg-success')

    // ✅ FORMA RECOMENDADA - Espera automática + validación
    await expect(successButton).toHaveText('Data loaded with AJAX get request.', {
        timeout: 16000
    })
})

test('alternative waits', async ({page}) => {
    const successButton = page.locator('.bg-success')

    // Opción 1: Esperar a que el elemento exista
    await page.waitForSelector('.bg-success')

    // Opción 2: Esperar respuesta HTTP específica
    await page.waitForResponse('http://uitestingplayground.com/ajaxdata')

    // Extraer y validar
    const text = await successButton.allTextContents()
    expect(text).toContain('Data loaded with AJAX get request.')
})
```

---

## Buenas Prácticas

### ✅ Hacer

```typescript
// Usar expect() con timeout personalizado si es necesario
await expect(element).toBeVisible({ timeout: 10000 })

// Esperar respuestas específicas
await page.waitForResponse(/api\/data/)

// Esperar estados específicos
await element.waitFor({ state: 'visible' })
```

---

### ❌ Evitar

```typescript
// ❌ NO usar timeouts fijos
await page.waitForTimeout(5000)

// ❌ NO usar networkidle sin razón muy específica
await page.waitForLoadState('networkidle')

// ❌ NO extraer sin esperar
const text = await element.textContent()  // Puede fallar si no está listo
expect(text).toEqual('Expected')

// ✅ MEJOR: Validar directamente
await expect(element).toHaveText('Expected')
```

---

## Resumen

1. **Playwright espera automáticamente** - No necesitas esperas explícitas en la mayoría de casos
2. **Usa `expect()` siempre que sea posible** - Combina espera + validación
3. **`waitFor()`, `waitForSelector()`, `waitForResponse()`** - Para casos específicos
4. **Evita `waitForTimeout()` y `networkidle`** - Causan tests lentos e inestables
5. **Configura timeout solo cuando sea necesario** - El default de 30s es suficiente en la mayoría de casos
