# ✅ Validaciones y Assertions

## ¿Qué son las Assertions?

Las assertions son **comparaciones entre el valor real y el valor esperado** en un test.

### Estructura básica:
```typescript
expect(valorReal).comparador(valorEsperado)
```

**Si la comparación falla** → ❌ El test falla  
**Si la comparación pasa** → ✅ El test continúa

---

## Importar expect

```typescript
import { test, expect } from '@playwright/test';
```

---

## Tipos de Assertions

### 1. Validar URL
```typescript
// URL exacta
await expect(page).toHaveURL('https://deals.ezra.fi/')

// URL con regex (más flexible)
await expect(page).toHaveURL(/.*dashboard/)
```

### 2. Validar texto
```typescript
// Texto exacto
await expect(page.locator('h1')).toHaveText('Welcome')

// Que contenga texto
await expect(page.locator('h1')).toContainText('Welc')

// Texto del botón
const buttonText = await page.locator('button').textContent()
expect(buttonText).toEqual('Submit')
```

### 3. Validar visibilidad
```typescript
// Que sea visible
await expect(page.getByText('Welcome')).toBeVisible()

// Que NO sea visible
await expect(page.getByText('Error')).not.toBeVisible()

// Que esté oculto
await expect(page.locator('.hidden')).toBeHidden()
```

### 4. Validar cantidad de elementos
```typescript
const items = await page.locator('.item').count()
expect(items).toBe(5)  // Exactamente 5

await expect(page.locator('.item')).toHaveCount(5)  // Alternativa
```

### 5. Validar valores de formularios
```typescript
// Valor de input
await expect(page.getByLabel('Email')).toHaveValue('test@test.com')

// Checkbox marcado
await expect(page.getByRole('checkbox')).toBeChecked()

// Select con opción seleccionada
await expect(page.locator('select')).toHaveValue('option1')
```

### 6. Validar atributos
```typescript
// Que tenga un atributo
await expect(page.locator('button')).toHaveAttribute('disabled')

// Atributo con valor específico
await expect(page.locator('a')).toHaveAttribute('href', '/dashboard')

// Que tenga una clase
await expect(page.locator('div')).toHaveClass(/active/)
```

---

## Comparadores Comunes

| Comparador | Qué valida | Ejemplo |
|------------|------------|---------|
| `toEqual()` | Igualdad exacta | `expect(text).toEqual('Submit')` |
| `toBe()` | Igualdad estricta | `expect(count).toBe(5)` |
| `toContain()` | Que contenga algo | `expect(list).toContain('item')` |
| `toBeVisible()` | Que sea visible | `await expect(element).toBeVisible()` |
| `toBeHidden()` | Que esté oculto | `await expect(element).toBeHidden()` |
| `toHaveURL()` | URL específica | `await expect(page).toHaveURL(url)` |
| `toHaveText()` | Texto exacto | `await expect(element).toHaveText('Hi')` |
| `toContainText()` | Contiene texto | `await expect(element).toContainText('H')` |
| `toHaveValue()` | Valor de input | `await expect(input).toHaveValue('test')` |
| `toBeChecked()` | Checkbox marcado | `await expect(checkbox).toBeChecked()` |
| `toHaveCount()` | Cantidad exacta | `await expect(list).toHaveCount(3)` |
| `toHaveAttribute()` | Atributo | `await expect(el).toHaveAttribute('id')` |

---

## Extracción de Valores vs Validación

### 🔍 Extraer valores (obtener información)

```typescript
// Extraer texto
const buttonText = await page.locator('button').textContent()
const heading = await page.locator('h1').innerText()

// Extraer atributo
const href = await page.locator('a').getAttribute('href')

// Extraer valor de input
const email = await page.locator('input').inputValue()

// Contar elementos
const count = await page.locator('.item').count()
```

### ✅ Validar (verificar que es correcto)

```typescript
// Validar el texto extraído
const buttonText = await page.locator('button').textContent()
expect(buttonText).toEqual('Submit')  // Assertion

// O validar directamente sin extraer
await expect(page.locator('button')).toHaveText('Submit')
```

---

## Proceso completo: Localizar → Extraer → Validar

```typescript
// 1. LOCALIZAR el elemento (identificar dónde está)
const basicForm = page.locator('nb-card').filter({ hasText: "Basic Form" })
const button = basicForm.locator('button')

// 2. EXTRAER su información
const buttonText = await button.textContent()

// 3. VALIDAR que es correcta
expect(buttonText).toEqual('Submit')
```

---

## ⚠️ Malas Prácticas vs Buenas Prácticas

### ❌ Mal - Sin validaciones
```typescript
test('User login', async ({page}) => {
    await page.getByLabel('Email').fill('test@test.com')
    await page.getByLabel('Password').fill('123456')
    await page.getByRole('button', {name: 'Sign in'}).click()
    await page.waitForTimeout(3000)  // ❌ Solo espera, no valida nada
})
```

**Problema:** El test no verifica que el login funcionó. Solo hace clicks.

---

### ✅ Bien - Con validaciones
```typescript
test('User login', async ({page}) => {
    await page.getByLabel('Email').fill('test@test.com')
    await page.getByLabel('Password').fill('123456')
    await page.getByRole('button', {name: 'Sign in'}).click()
    
    // ✅ Validar que el login fue exitoso
    await expect(page).toHaveURL('https://deals.ezra.fi/')
    // O validar que apareció un elemento del dashboard:
    await expect(page.getByText('Welcome')).toBeVisible()
})
```

**Ventaja:** 
- Espera inteligente (continúa apenas cambia la URL)
- Valida que el login funcionó correctamente
- Si falla, el test detecta el error

---

## waitForTimeout vs expect

### ❌ `waitForTimeout(ms)` - Mala práctica
```typescript
await page.waitForTimeout(3000)  // Siempre espera 3 segundos
```

**Problemas:**
- Tiempo fijo innecesario (si carga en 0.5s, pierde 2.5s)
- Si tarda más, falla sin motivo claro
- **No valida nada** → puede fallar silenciosamente

---

### ✅ `expect()` - Buena práctica
```typescript
await expect(page).toHaveURL('https://deals.ezra.fi/')
```

**Ventajas:**
- **Espera inteligente** hasta 30s (configurable)
- Continúa inmediatamente cuando se cumple
- **Valida que algo ocurrió**
- Error claro si falla

---

## Regla de Oro

> **Un test sin `expect()` no es un test**, es solo una automatización de clicks.

**Siempre valida** que el resultado es el esperado.

---

## Ejemplo Real Completo

```typescript
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    await page.goto('https://deals.ezra.fi/signin')
})

test('User login', async ({page}) => {
    // 1. Acciones
    await page.getByRole('textbox', {name: 'Your email address'})
        .fill('alberto.marin@strivelabs.io')
    await page.getByRole('button', {name: 'Continue with email'}).click()
    
    await page.getByRole('textbox', {name: 'Your password'})
        .fill('Ezra1234.')
    await page.getByRole('button', {name: 'Continue with email'}).click()
    
    // 2. Validaciones
    await expect(page).toHaveURL('https://deals.ezra.fi/')
    await expect(page.getByText('Dashboard')).toBeVisible()
})

test('Extract and validate button text', async ({page}) => {
    const basicForm = page.locator('nb-card').filter({ hasText: "Basic Form" })
    
    // Extraer texto
    const buttonText = await basicForm.locator('button').textContent()
    
    // Validar texto
    expect(buttonText).toEqual('Submit')
    
    // O validar directamente (más común)
    await expect(basicForm.locator('button')).toHaveText('Submit')
})
```
