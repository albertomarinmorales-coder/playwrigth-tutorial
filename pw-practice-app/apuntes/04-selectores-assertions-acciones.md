# 🎯 Selectores, Assertions y Acciones

## Selectores

### Tipos de Selectores con locator()

Playwright ofrece múltiples formas de localizar elementos en la página:

#### 1. Por Tag Name (etiqueta HTML)
```typescript
page.locator('input')      // Todos los elementos <input>
page.locator('button')     // Todos los elementos <button>
page.locator('div')        // Todos los elementos <div>
```

#### 2. Por ID
```typescript
page.locator('#inputEmail')     // Elemento con id="inputEmail"
page.locator('#submitBtn')      // Elemento con id="submitBtn"
```

#### 3. Por Class
```typescript
page.locator('.shape-rectangle')   // Elementos con class="shape-rectangle"
page.locator('.btn-primary')       // Elementos con class="btn-primary"
```

#### 4. Por Atributo
```typescript
page.locator('[placeholder="Email"]')      // Input con placeholder="Email"
page.locator('[type="submit"]')            // Elemento con type="submit"
page.locator('[data-testid="login-btn"]')  // Por data attribute
```

#### 5. Combinando Selectores
```typescript
page.locator('input[placeholder="Email"].shape-rectangle')
// Input + placeholder="Email" + class="shape-rectangle"

page.locator('button[type="submit"].primary')
// Button + type="submit" + class="primary"
```

#### 6. Por XPath (❌ NO RECOMENDADO)
```typescript
page.locator('//*[@id="inputEmail"]')  // Funciona pero NO se recomienda
```
**Razón:** XPath es frágil y difícil de mantener. Usa otros selectores.

#### 7. Por Texto Parcial
```typescript
page.locator(':text("Using")')  // Elementos que contienen "Using"
```

#### 8. Por Texto Exacto
```typescript
page.locator(':text-is("Using the Grid")')  // Coincidencia exacta
```

---

### Métodos de Filtrado

#### .first()
Selecciona el **primer elemento** cuando hay múltiples coincidencias.

```typescript
await page.locator('input').first().click()
// Si hay 10 inputs, hace clic en el primero
```

**Otros métodos similares:**
```typescript
page.locator('input').last()        // Último elemento
page.locator('input').nth(2)        // Tercer elemento (índice 2)
page.locator('input').count()       // Cantidad de elementos
```

**Importante:** `first()`, `last()`, `nth()` NO necesitan `await` (crean locators), pero las acciones sobre ellos SÍ:
```typescript
// ❌ Incorrecto
await page.locator('input').first()

// ✅ Correcto
await page.locator('input').first().click()
```

---

### getByText()
Localiza elementos por su texto visible. Es uno de los selectores más intuitivos.

```typescript
page.getByText('Forms')          // Busca un elemento que contenga el texto "Forms"
page.getByText('Form Layouts')   // Busca un elemento que contenga "Form Layouts"
```

**Características:**
- Busca texto visible en la página
- No necesita `await` (solo crea el locator)
- Se combina con acciones como `click()`, `fill()`, etc.

#### Problema: Strict Mode Violation

Si un selector encuentra **múltiples elementos**, Playwright lanza un error:

```typescript
// ❌ Error: getByText('Charts') encuentra 2 elementos: "Charts" y "Echarts"
await page.getByText('Charts').click()
```

**Error:**
```
Error: strict mode violation: getByText('Charts') resolved to 2 elements
```

**Solución 1: Usar `exact: true`**
```typescript
// ✅ Solo encuentra el texto exacto "Charts"
await page.getByText('Charts', { exact: true }).click()
```

**Solución 2: Usar `getByRole()` (mejor práctica)**
```typescript
// ✅ Más específico y accesible
await page.getByRole('link', { name: 'Charts', exact: true }).click()
```

### getByRole()
Localiza elementos por su rol ARIA (accesibilidad). Es la **mejor práctica** según Playwright.

```typescript
page.getByRole('link', { name: 'Charts', exact: true })
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
```

**Ventajas:**
- ✅ Más robusto que `getByText()`
- ✅ Mejor para accesibilidad
- ✅ Evita ambigüedades
- ✅ Playwright lo recomienda en los errores

**Roles comunes:**
- `link` - Enlaces
- `button` - Botones
- `textbox` - Campos de texto
- `checkbox` - Checkboxes
- `heading` - Encabezados

---

## User-Facing Locators (Selectores orientados al usuario)

Los **User-Facing Locators** son la **forma recomendada** por Playwright. Simulan cómo un usuario real interactúa con la aplicación.

### ¿Por qué usarlos?

✅ **Más robustos:** No se rompen si cambia el HTML interno  
✅ **Mejor accesibilidad:** Si funcionan para Playwright, funcionan para usuarios con lectores de pantalla  
✅ **Código más legible:** Se entiende qué hace el test sin ver la página  
✅ **Fácil mantenimiento:** Menos frágiles ante cambios en la UI  

---

### Tipos de User-Facing Locators:

#### 1. getByRole()
Localiza elementos por su rol ARIA. **Primera opción recomendada.**

```typescript
// Campo de texto (input) con label "Email"
await page.getByRole('textbox', {name: "Email"}).first().click()

// Botón con texto "Sign in"
await page.getByRole('button', {name: "Sign in"}).first().click()
```

**Uso de `.first()`:**  
Si hay múltiples elementos con el mismo rol/nombre, usa `.first()`, `.last()` o `.nth()` para seleccionar uno específico.

---

#### 2. getByLabel()
Localiza inputs por su `<label>` asociado. Ideal para formularios.

```typescript
// Encuentra el input asociado al label "Email"
await page.getByLabel('Email').first().click()

// También funciona con labels parciales
await page.getByLabel('Password').click()
```

**Ventaja:** Simula cómo un usuario busca un campo por su etiqueta.

---

#### 3. getByPlaceholder()
Localiza inputs por su atributo `placeholder`.

```typescript
// Input con placeholder="Jane Doe"
await page.getByPlaceholder('Jane Doe').click()

// Rellenar un campo por su placeholder
await page.getByPlaceholder('Enter your email').fill('test@example.com')
```

**Cuándo usar:** Cuando el input no tiene label pero sí placeholder descriptivo.

---

#### 4. getByText()
Localiza elementos por su texto visible.

```typescript
// Encuentra y hace clic en el texto "Using the Grid"
await page.getByText('Using the Grid').click()

// Buscar texto parcial
await page.getByText('Submit').click()
```

**Ya explicado anteriormente.** Útil para enlaces, encabezados, párrafos, etc.

---

#### 5. getByTitle()
Localiza elementos por su atributo `title` (tooltip).

```typescript
// Elemento con title="IoT Dashboard"
await page.getByTitle('IoT Dashboard').click()

// Común en iconos o botones con tooltip
await page.getByTitle('Close').click()
```

**Cuándo usar:** Para iconos o elementos que muestran información al hacer hover.

---

#### 6. getByAltText()
Localiza imágenes por su atributo `alt`.

```typescript
await page.getByAltText('Profile picture').click()
await page.getByAltText('Company logo').click()
```

**Uso:** Específico para imágenes `<img>`.

---

#### 7. getByTestId()
Localiza elementos por el atributo `data-testid`. **Útil para testing específico.**

```typescript
// En el HTML: <button data-testid="TestId">Sign in</button>
await page.getByTestId('TestId').click()

// Ejemplo de formulario
await page.getByTestId('submit-button').click()
await page.getByTestId('cancel-btn').click()
```

**Cuándo usar:**
- ✅ Cuando añades atributos específicos para testing
- ✅ Cuando otros selectores son inestables
- ✅ Para elementos sin texto visible o label claro

**Configuración:**  
Por defecto, Playwright busca `data-testid`. Si tu proyecto usa otro atributo (ej: `data-test`), configúralo en `playwright.config.ts`:

```typescript
use: {
  testIdAttribute: 'data-test'  // Cambia el atributo por defecto
}
```

**Ventaja:** Independiente de cambios visuales o de texto en la UI.

---

### Ejemplo completo: User-Facing Locators en acción

```typescript
test('User facing locators', async({page}) => {
    // Por rol y nombre (input de email)
    await page.getByRole('textbox', {name: "Email"}).first().click()
    
    // Por rol y nombre (botón)
    await page.getByRole('button', {name: "Sign in"}).first().click()
    
    // Por label asociado
    await page.getByLabel('Email').first().click()
    
    // Por placeholder
    await page.getByPlaceholder('Jane Doe').click()
    
    // Por texto visible
    await page.getByText('Using the Grid').click()
    
    // Por atributo title
    await page.getByTitle('IoT Dashboard').click()
    
    // Por data-testid
    await page.getByTestId('TestId').click()
})
```

---

### Comparación: locator() vs User-Facing Locators

| Aspecto | `locator()` | User-Facing Locators |
|---------|-------------|---------------------|
| **Robustez** | ❌ Frágil (depende de HTML) | ✅ Robusto (independiente del HTML) |
| **Legibilidad** | ⚠️ Requiere conocer el HTML | ✅ Describe la intención |
| **Mantenimiento** | ❌ Se rompe con cambios | ✅ Resistente a cambios |
| **Accesibilidad** | ❌ No garantiza | ✅ Garantiza accesibilidad |
| **Cuándo usar** | Como último recurso | Siempre que sea posible |

```typescript
// ❌ Frágil: Si cambia el ID, el test falla
await page.locator('#email-field-123-xyz').fill('test@example.com')

// ✅ Robusto: Funciona mientras exista un campo con label "Email"
await page.getByLabel('Email').fill('test@example.com')
```

**Regla de oro:** Usa User-Facing Locators siempre que puedas. Solo usa `locator()` cuando no haya otra opción.

---

## Localizar Elementos Hijos (Chaining Locators)

Cuando necesitas ser más específico y buscar elementos **dentro de un contenedor**, puedes encadenar selectores.

### Sintaxis 1: Selector CSS anidado (todo en uno)

```typescript
// Busca un radio button con texto "Option 1" dentro de un nb-card
await page.locator('nb-card nb-radio :text-is("Option 1")').click()
```

**Uso:** Rápido pero menos legible. Todo el selector en una línea.

---

### Sintaxis 2: Encadenar con .locator()

```typescript
// Mismo resultado, pero encadenando selectores
await page.locator('nb-card')
    .locator('nb-radio')
    .locator(':text-is("Option 2")')
    .click()
```

**Ventajas:**
- ✅ Más legible
- ✅ Fácil de depurar (puedes ver cada paso)
- ✅ Reutilizable

---

### Sintaxis 3: Combinar locator() con User-Facing Locators (RECOMENDADO)

```typescript
// 1. Localiza el contenedor
// 2. Busca el botón "Sign in" dentro del contenedor usando getByRole
await page.locator('nb-card')
    .getByRole('button', {name:'Sign in'})
    .first()
    .click()
```

**Consejo del desarrollador:**  
> Si necesitas buscar un **botón** dentro de un **contenedor**, señala el contenedor con `locator()` y luego usa `getByRole()` para buscar el botón por texto.

**Ventajas:**
- ✅ **Mejor práctica** según Playwright
- ✅ Combina precisión del contenedor con robustez de User-Facing Locators
- ✅ Más resistente a cambios en el HTML

---

### Sintaxis 4: Usar .nth() para seleccionar por posición

```typescript
// Selecciona el 3er nb-card (índice 2) y busca su botón
await page.locator('nb-card').nth(2).getByRole('button').click()
```

**Uso de `.nth()`:**
- `nth(0)` → Primer elemento
- `nth(1)` → Segundo elemento
- `nth(2)` → Tercer elemento
- etc.

---

### Ejemplo completo: Localizar elementos hijos

```typescript
test('location child elements', async({page}) => {
    // Método 1: Selector CSS todo en uno
    await page.locator('nb-card nb-radio :text-is("Option 1")').click()
    
    // Método 2: Encadenar locators
    await page.locator('nb-card')
        .locator('nb-radio')
        .locator(':text-is("Option 2")')
        .click()
    
    // Método 3: locator() + getByRole() [RECOMENDADO]
    await page.locator('nb-card')
        .getByRole('button', {name:'Sign in'})
        .first()
        .click()
    
    // Método 4: nth() para seleccionar por posición + getByRole()
    await page.locator('nb-card').nth(2).getByRole('button').click()
})
```

---

### Cuándo usar cada método:

| Método | Cuándo usar |
|--------|-------------|
| **CSS anidado** | Para selectores muy específicos y cortos |
| **Encadenar .locator()** | Cuando necesitas construir el selector paso a paso |
| **locator() + getByRole()** | ⭐ **RECOMENDADO** - Contenedor específico + selector robusto |
| **.nth()** | Cuando el elemento está en una posición específica conocida |

**Tip:** Siempre que puedas, combina `locator()` para el contenedor con User-Facing Locators (`getByRole`, `getByText`, etc.) para el elemento específico.

---

## Localizar Elementos Padres (Parent Locators)

A veces necesitas **buscar un contenedor** que contenga cierto elemento o texto, y luego interactuar con otros elementos dentro de ese contenedor.

### Método 1: Buscar texto dentro de un contenedor con :text-is()

```typescript
// Busca el texto "Using the Grid" dentro de cualquier nb-card
await page.locator('nb-card').locator(':text-is("Using the Grid")').click()
```

**Uso:** `:text-is()` busca **DONDE está el texto** de forma muy precisa (coincidencia exacta).

---

### Método 2: hasText - Buscar el contenedor que contiene el texto

```typescript
// Busca el nb-card que contiene el texto "Using the Grid"
await page.locator('nb-card', { hasText: "Using the Grid" }).click()
```

**Diferencia importante:**
- `:text-is()` → Busca DONDE está el texto (el elemento específico con el texto)
- `hasText` → Busca el NODO/contenedor que contiene ese texto en cualquier lugar

---

### Método 3: Combinar hasText con búsqueda de elementos hijos

```typescript
// 1. Busca el nb-card que contiene "Using the Grid"
// 2. Dentro de ese card, busca el input con label "Email"
await page.locator('nb-card', { hasText: "Using the Grid" })
    .getByRole('textbox', { name: "Email" })
    .click()
```

**Ventaja:** Muy específico - encuentra el contenedor correcto y luego el elemento específico dentro.

---

### Método 4: has - Buscar contenedor que tiene un elemento específico

```typescript
// Busca el nb-card que CONTIENE un elemento con id="inputEmail1"
await page.locator('nb-card', { has: page.locator('#inputEmail1') })
    .getByRole('textbox', { name: "Email" })
    .click()
```

**Uso de `has`:**
- Busca contenedores que contengan un elemento específico (por selector CSS, ID, clase, etc.)
- Más preciso que `hasText` cuando el texto puede ser ambiguo

---

### Método 5: filter() - Filtrar resultados

```typescript
// Filtra todos los nb-card y quédate solo con el que tiene "Basic Form"
await page.locator('nb-card')
    .filter({ hasText: "Basic Form" })
    .getByRole('textbox', { name: "Email" })
    .click()

// Filtrar por elemento hijo específico
await page.locator('nb-card')
    .filter({ has: page.locator('.status-danger') })
    .getByRole('textbox', { name: 'Password' })
    .click()
```

**`filter()` vs opciones del locator:**
- Ambos hacen lo mismo
- `filter()` es más explícito y se puede encadenar múltiples veces

---

### Método 6: Múltiples filtros encadenados

```typescript
// 1. Busca nb-card que contiene un checkbox
// 2. De esos, filtra el que tiene texto "Sign in"
// 3. Dentro, busca el input "Email"
await page.locator('nb-card')
    .filter({ has: page.locator('nb-checkbox') })
    .filter({ hasText: "Sign in" })
    .getByRole('textbox', { name: 'Email' })
    .click()
```

**Uso:** Para ser **muy específico** cuando hay múltiples contenedores similares.

---

### Ejemplo completo: Localizar elementos padres

```typescript
test('locating parent elements', async ({ page }) => {
    // Método 1: :text-is() - Busca DONDE está el texto
    await page.locator('nb-card')
        .locator(':text-is("Using the Grid")')
        .click()
    
    // Método 2: hasText - Busca el NODO que contiene el texto
    await page.locator('nb-card', { hasText: "Using the Grid" }).click()
    
    // Método 3: hasText + getByRole
    await page.locator('nb-card', { hasText: "Using the Grid" })
        .getByRole('textbox', { name: "Email" })
        .click()
    
    // Método 4: has - Busca contenedor con elemento específico
    await page.locator('nb-card', { has: page.locator('#inputEmail1') })
        .getByRole('textbox', { name: "Email" })
        .click()
    
    // Método 5: filter() con hasText
    await page.locator('nb-card')
        .filter({ hasText: "Basic Form" })
        .getByRole('textbox', { name: "Email" })
        .click()
    
    // Método 6: filter() con has (elemento hijo)
    await page.locator('nb-card')
        .filter({ has: page.locator('.status-danger') })
        .getByRole('textbox', { name: 'Password' })
        .click()
    
    // Método 7: Múltiples filtros encadenados
    await page.locator('nb-card')
        .filter({ has: page.locator('nb-checkbox') })
        .filter({ hasText: "Sign in" })
        .getByRole('textbox', { name: 'Email' })
        .click()
})
```

---

### Comparación de métodos:

| Método | Descripción | Cuándo usar |
|--------|-------------|-------------|
| `:text-is()` | Busca el elemento exacto con el texto | Hacer clic en el texto mismo |
| `hasText` | Busca contenedor que contiene el texto | Encontrar contenedor por su contenido |
| `has` | Busca contenedor que contiene un elemento | Cuando el texto es ambiguo pero el elemento es único |
| `filter({ hasText })` | Filtra por texto | Más explícito, encadenable |
| `filter({ has })` | Filtra por elemento hijo | Más explícito, encadenable |
| Múltiples `filter()` | Filtros combinados | Cuando necesitas ser MUY específico |

**Patrón recomendado:**
1. Localiza el contenedor padre (con `hasText`, `has` o `filter()`)
2. Busca el elemento específico dentro con User-Facing Locators (`getByRole`, `getByLabel`, etc.)

---

## Acciones

### click()
Hace clic en un elemento.

```typescript
await page.getByText('Forms').click();
await page.getByText('Form Layouts').click();
```

**Importante:** 
- ✅ Necesita `await` (retorna una Promise)
- Espera a que el elemento sea visible y clickeable
- Útil para navegación, botones, enlaces, etc.

---

## Ejemplo completo: Navegación

```typescript
import {test} from '@playwright/test';

test('navegación básica', async({page}) => {
    await page.goto('http://localhost:4200/')
    await page.getByText('Forms').click();
    await page.getByText('Form Layouts').click();
})
```

**Flujo:**
1. `page.goto()` - Navega a la URL
2. `page.getByText('Forms')` - Localiza el elemento con texto "Forms"
3. `.click()` - Hace clic en ese elemento
4. Repite para navegar a "Form Layouts"

---

## Assertions

_Contenido próximamente..._

---

[⬅️ Anterior: Estructura de Tests](03-estructura-de-tests.md) | [Volver al índice](README.md) | [Siguiente: Problemas y Soluciones ➡️](05-problemas-y-soluciones.md)
