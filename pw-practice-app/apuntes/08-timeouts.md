# ⏱️ Timeouts en Playwright

## Tipos de Timeouts

Playwright tiene **3 niveles** de configuración de timeout:

1. **Timeout global** - Para todos los tests del proyecto
2. **Timeout de test individual** - Para un test específico
3. **Timeout de assertion/acción** - Para una acción o assertion específica

---

## 1. Timeout Global (playwright.config.ts)

Se configura en el archivo `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 30000, // 30 segundos por test (default)
  expect: {
    timeout: 5000 // 5 segundos para assertions (default)
  }
})
```

**Aplica a:**
- Todos los tests del proyecto
- Todas las assertions

---

## 2. Timeout de Test Individual

### Opción A: `test.setTimeout()` - Dentro del test

```typescript
test('timeouts', async ({page}) => {
    test.setTimeout(10000) // 10 segundos para este test
    
    const successButton = page.locator('.bg-success')
    await successButton.click()
})
```

---

### Opción B: `test.slow()` - Triplicar el timeout

```typescript
test('timeouts', async ({page}) => {
    test.slow() // Multiplica el timeout por 3
    // Si el timeout era 30s, ahora será 90s
    
    const successButton = page.locator('.bg-success')
    await successButton.click()
})
```

**Cuándo usar `test.slow()`:**
- Tests que sabes que son lentos (subida de archivos, procesamiento pesado)
- Operaciones que requieren más tiempo del normal
- Mejor que poner un número fijo

---

### Opción C: Configurar timeout en `beforeEach`

```typescript
test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('http://uitestingplayground.com/ajax')
    await page.getByText('Button Triggering AJAX Request').click()
    
    // Agregar 2 segundos extra al timeout de cada test
    testInfo.setTimeout(testInfo.timeout + 2000)
})
```

**Útil cuando:**
- Todos los tests de un archivo necesitan más tiempo
- Quieres ajustar el timeout basándote en el valor actual

---

## 3. Timeout de Assertion/Acción Específica

### Para assertions con `expect()`

```typescript
const successButton = page.locator('.bg-success')

// Timeout específico de 16 segundos para esta assertion
await expect(successButton).toHaveText('Data loaded with AJAX get request.', {
    timeout: 16000
})
```

---

### Para acciones de página

```typescript
// Timeout de 10 segundos para este click específico
await page.click('button', { timeout: 10000 })

// Timeout de 5 segundos para este fill
await page.fill('input', 'text', { timeout: 5000 })

// Timeout para waitForSelector
await page.waitForSelector('.element', { timeout: 15000 })
```

---

## Jerarquía de Timeouts

```
Timeout específico de acción/assertion
         ↓ (si no está definido)
Timeout del test individual
         ↓ (si no está definido)
Timeout global del proyecto
```

**El más específico siempre gana.**

---

## Ejemplos Completos

### Ejemplo 1: Test con timeout personalizado

```typescript
test('slow operation', async ({page}) => {
    test.setTimeout(60000) // 60 segundos para este test
    
    await page.goto('https://example.com/upload')
    await page.setInputFiles('input[type="file"]', 'large-file.zip')
    await expect(page.getByText('Upload successful')).toBeVisible()
})
```

---

### Ejemplo 2: Test lento con `test.slow()`

```typescript
test('video processing', async ({page}) => {
    test.slow() // Triplica el timeout automáticamente
    
    await page.goto('https://example.com/process')
    await page.click('button[name="process-video"]')
    await expect(page.getByText('Processing complete')).toBeVisible()
})
```

---

### Ejemplo 3: Timeout en beforeEach

```typescript
test.beforeEach(async ({ page }, testInfo) => {
    await page.goto('http://uitestingplayground.com/ajax')
    await page.getByText('Button Triggering AJAX Request').click()
    
    // Todos los tests de este archivo tendrán 2s extra
    testInfo.setTimeout(testInfo.timeout + 2000)
})

test('ajax test 1', async ({page}) => {
    // Heredará el timeout modificado
    await expect(page.locator('.bg-success')).toBeVisible()
})
```

---

### Ejemplo 4: Timeout específico en assertion

```typescript
test('ajax loading', async ({page}) => {
    const successButton = page.locator('.bg-success')
    
    // Este assertion espera hasta 16 segundos
    await expect(successButton).toHaveText('Data loaded with AJAX get request.', {
        timeout: 16000
    })
})
```

---

## Valores por Defecto

| Tipo | Timeout Default | Configurable en |
|------|-----------------|-----------------|
| Test completo | 30,000 ms (30s) | `playwright.config.ts` → `timeout` |
| Assertion (`expect`) | 5,000 ms (5s) | `playwright.config.ts` → `expect.timeout` |
| Navegación | 30,000 ms (30s) | `playwright.config.ts` → `use.navigationTimeout` |
| Acción (click, fill) | 30,000 ms (30s) | `playwright.config.ts` → `use.actionTimeout` |

---

## Buenas Prácticas

### ✅ Hacer

```typescript
// Usar test.slow() para tests conocidos como lentos
test('slow process', async ({page}) => {
    test.slow()
    // ... operación lenta
})

// Timeout específico en assertions cuando sea necesario
await expect(element).toBeVisible({ timeout: 10000 })

// Configurar timeouts globales razonables en config
export default defineConfig({
  timeout: 60000, // Tests más lentos
  expect: { timeout: 10000 } // Assertions más lentas
})
```

---

### ❌ Evitar

```typescript
// ❌ NO poner timeouts enormes por defecto
test.setTimeout(999999) // Malo

// ❌ NO usar waitForTimeout en lugar de aumentar timeout
await page.waitForTimeout(30000) // Malo
// ✅ Mejor aumentar timeout del assertion
await expect(element).toBeVisible({ timeout: 30000 })

// ❌ NO modificar timeout si no es necesario
test.setTimeout(100000) // Solo si realmente lo necesitas
```

---

## Debugging de Timeouts

### Error típico:
```
Error: Test timeout of 30000ms exceeded.
```

### Soluciones:

1. **Aumentar timeout del test:**
```typescript
test.setTimeout(60000)
```

2. **Usar `test.slow()`:**
```typescript
test.slow()
```

3. **Aumentar timeout de assertion específica:**
```typescript
await expect(element).toBeVisible({ timeout: 45000 })
```

4. **Revisar si hay un problema real:**
- ¿El elemento realmente tarda tanto?
- ¿Hay un error en el selector?
- ¿La página se carga correctamente?

---

## Resumen

| Nivel | Método | Uso |
|-------|--------|-----|
| Global | `playwright.config.ts` | Todo el proyecto |
| Test | `test.setTimeout()` | Un test específico |
| Test | `test.slow()` | Test lento (x3 timeout) |
| BeforeEach | `testInfo.setTimeout()` | Todos los tests del archivo |
| Assertion | `{ timeout: ms }` | Una assertion/acción específica |

**Regla de oro:** Usa el nivel más específico posible. No aumentes timeouts globales sin razón.
