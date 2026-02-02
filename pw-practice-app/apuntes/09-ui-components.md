# 🎨 Interacción con UI Components

## Input Fields (Campos de Texto)

### Métodos de llenado de inputs

```typescript
const emailInput = page.locator('nb-card', {hasText: 'Using the Grid'})
                      .getByRole('textbox', {name: 'Email'})

// 1. fill() - Llena el campo instantáneamente
await emailInput.fill('test@test.com')

// 2. clear() - Limpia el campo
await emailInput.clear()

// 3. pressSequentially() - Escribe caracter por caracter con delay
await emailInput.pressSequentially('test@test.com', {delay: 100})
```

### Validar valores de inputs

```typescript
// Opción 1: Generic assertion (extraer y validar)
const inputValue = await emailInput.inputValue()
expect(inputValue).toEqual('test@test.com')

// Opción 2: Locator assertion (recomendada - espera automática)
await expect(emailInput).toHaveValue('test@test.com')
```

---

## Radio Buttons

### Seleccionar y validar radio buttons

```typescript
const form = page.locator('nb-card', {hasText: 'Using the Grid'})

// Seleccionar un radio button
await form.getByRole('radio', {name: 'Option 1'}).check({force: true})

// Validar que está seleccionado
const radioStatus = await form.getByLabel('Option 1').isChecked()
expect(radioStatus).toBeTruthy()

// O usar locator assertion (mejor)
await expect(form.getByRole('radio', {name: 'Option 1'})).toBeChecked()
```

### Radio buttons son mutuamente exclusivos

```typescript
// Seleccionar Option 2 desmarca automáticamente Option 1
await form.getByRole('radio', {name: 'Option 2'}).check({force: true})

// Validar que Option 1 ya NO está seleccionado
expect(await form.getByRole('radio', {name: 'Option 1'}).isChecked()).toBeFalsy()

// Validar que Option 2 SÍ está seleccionado
expect(await form.getByRole('radio', {name: 'Option 2'}).isChecked()).toBeTruthy()
```

---

## Checkboxes

### Diferencia entre `.check()` y `.click()`

```typescript
// check() - SIEMPRE marca el checkbox (idempotente)
await page.getByRole('checkbox', {name: 'Hide on click'}).check({force: true})

// click() - Alterna el estado (toggle)
await page.getByRole('checkbox', {name: 'Hide on click'}).click({force: true})
```

**Recomendación:**
- Usa `.check()` cuando quieres asegurar que esté marcado
- Usa `.uncheck()` cuando quieres asegurar que esté desmarcado
- Usa `.click()` solo si necesitas alternar sin importar el estado

### Iterar sobre múltiples checkboxes

```typescript
const allCheckboxes = page.getByRole('checkbox')

// Obtener todos los checkboxes como array
for (const checkbox of await allCheckboxes.all()) {
    await checkbox.uncheck({force: true})
    expect(await checkbox.isChecked()).toBeFalsy()
}
```

---

## Lists y Dropdowns

### Identificar listas

```typescript
page.getByRole('list')     // Cuando la lista tiene tag <ul>
page.getByRole('listitem') // Cuando los elementos tienen tag <li>

// Para componentes custom
const optionList = page.locator('nb-option-list nb-option')
```

### Validar contenido de lista

```typescript
// Validar que la lista tiene exactamente estos textos en orden
await expect(optionList).toHaveText(['Light', 'Dark', 'Cosmic', 'Corporate'])
```

### Seleccionar opciones de dropdown

```typescript
const dropdownMenu = page.locator('ngx-header nb-select')
await dropdownMenu.click()

const optionList = page.locator('nb-option-list nb-option')

// Seleccionar por texto
await optionList.filter({hasText: 'Cosmic'}).click()
```

### Validar CSS después de selección

```typescript
const header = page.locator('nb-layout-header')

// Validar color de fondo
await expect(header).toHaveCSS('background-color', 'rgb(50, 50, 89)')
```

### Iterar sobre opciones con Object.entries()

```typescript
const colors = {
    "Light": 'rgb(255, 255, 255)',
    "Dark": 'rgb(34, 43, 69)',
    "Cosmic": 'rgb(50, 50, 89)',
    "Corporate": 'rgb(255, 255, 255)'
}

await dropdownMenu.click()

// ✅ Usar Object.entries() para evitar errores de TypeScript
for (const [color, value] of Object.entries(colors)) {
    await optionList.filter({hasText: color}).click()
    await expect(header).toHaveCSS('background-color', value)
    await dropdownMenu.click()
}
```

**⚠️ Problema con `for...in`:**
```typescript
// ❌ TypeScript error: "string no es una key válida"
for (const color in colors) {
    colors[color] // Error de TypeScript
}

// ✅ Solución 1: Object.entries()
for (const [color, value] of Object.entries(colors)) {
    // Funciona sin errores
}

// ✅ Solución 2: Type assertion
for (const color in colors) {
    colors[color as keyof typeof colors]
}
```

---

## Tooltips

### Mostrar y validar tooltips

```typescript
const tooltipCard = page.locator('nb-card', {hasText: 'Tooltip Placements'})
const topButton = tooltipCard.getByRole('button', {name: 'Top'})

// Esperar a que el botón sea visible
await topButton.waitFor({state: 'visible'})

// Hover sobre el botón para mostrar el tooltip
await topButton.hover()

// Localizar y validar el tooltip
const tooltip = page.locator('nb-tooltip')
await expect(tooltip).toContainText('This is a tooltip')
```

---

## Dialog Boxes (Cuadros de Diálogo)

### Manejar alertas/confirmaciones del navegador

```typescript
// Escuchar el evento de diálogo ANTES de la acción que lo dispara
page.on('dialog', async (dialog) => {
    // Validar mensaje
    expect(dialog.message()).toEqual('Are you sure you want to delete?')
    
    // Aceptar el diálogo
    await dialog.accept()
    
    // O rechazar: await dialog.dismiss()
})

// Ahora realizar la acción que dispara el diálogo
await page.getByRole('table')
    .locator('tr', {hasText: 'mdo@gmail.com'})
    .locator('.nb-trash')
    .click()

// Validar resultado
await expect(page.locator('table tr').first())
    .not.toHaveText('mdo@gmail.com')
```

**Importante:** El listener `page.on('dialog')` debe configurarse **ANTES** de la acción que dispara el diálogo.

---

## Tables (Tablas)

### 1. Seleccionar fila por texto

```typescript
// Buscar fila que contenga un texto específico
const row = page.getByRole('row', {name: 'twitter@outlook.com'})

// Interactuar con elementos de esa fila
await row.locator('.nb-edit').click()
```

### 2. Editar datos en tabla

```typescript
// Editar edad
await page.locator('input-editor').getByPlaceholder('Age').clear()
await page.locator('input-editor').getByPlaceholder('Age').fill('25')
await page.locator('.nb-checkmark').click() // Confirmar
```

### 3. Seleccionar fila por columna específica

```typescript
// Navegar a página 2
await page.locator(".ng2-smart-pagination-nav").getByText('2').click()

// Buscar fila donde la columna 1 (segunda columna) tenga el valor '11'
const targetRowById = page.getByRole('row', {name: '11'})
    .filter({has: page.locator('td').nth(1).getByText('11')})

// Editar email de esa fila
await targetRowById.locator('.nb-edit').click()
await page.locator('input-editor').getByPlaceholder('E-mail').clear()
await page.locator('input-editor').getByPlaceholder('E-mail').fill('test@test.com')
await page.locator('.nb-checkmark').click()

// Validar que cambió (columna 5 = índice 5)
await expect(targetRowById.locator('td').nth(5)).toHaveText('test@test.com')
```

### 4. Filtrar tabla y validar resultados

```typescript
const ages = ['20', '30', '40', '20000']

for (const age of ages) {
    // Aplicar filtro
    await page.locator('input-filter').getByPlaceholder('Age').clear()
    await page.locator('input-filter').getByPlaceholder('Age').fill(age)
    await page.waitForTimeout(500) // Esperar a que se aplique el filtro
    
    // Obtener todas las filas visibles
    const ageRows = page.locator('tbody tr')
    
    for (const row of await ageRows.all()) {
        const cellValue = await row.locator('td').last().textContent()
        
        if (age === '20000') {
            // No hay resultados
            expect(await page.getByRole('table').textContent())
                .toContain('No data found')
        } else {
            // Validar que cada fila tiene la edad correcta
            expect(cellValue).toEqual(age)
        }
    }
}
```

---

## Resumen de Métodos

| Elemento | Acción | Método |
|----------|--------|--------|
| Input | Llenar instantáneo | `.fill()` |
| Input | Escribir con delay | `.pressSequentially()` |
| Input | Limpiar | `.clear()` |
| Input | Obtener valor | `.inputValue()` |
| Radio | Seleccionar | `.check({force: true})` |
| Radio/Checkbox | Verificar estado | `.isChecked()` |
| Checkbox | Marcar | `.check({force: true})` |
| Checkbox | Desmarcar | `.uncheck({force: true})` |
| Checkbox | Toggle | `.click()` |
| Dropdown | Abrir | `.click()` |
| Lista | Seleccionar opción | `.filter({hasText: 'text'}).click()` |
| Tooltip | Mostrar | `.hover()` |
| Dialog | Aceptar | `dialog.accept()` |
| Dialog | Rechazar | `dialog.dismiss()` |
| Tabla | Seleccionar fila | `getByRole('row', {name: 'text'})` |
| Tabla | Columna específica | `.locator('td').nth(index)` |

---

## Datepickers (Calendarios)

### Manejo de fechas dinámicas

```typescript
const calendarInputField = page.getByPlaceholder('Form Picker')
await calendarInputField.click()

// 1. Calcular fecha futura (ejemplo: 14 días adelante)
let date = new Date()
date.setDate(date.getDate() + 14)

// 2. Extraer componentes de la fecha
const expectedDate = date.getDate().toString() // "16"
const expectedMonthShort = date.toLocaleString('en-US', {month: 'short'}) // "Feb"
const expectedMonthLong = date.toLocaleString('en-US', {month: 'long'}) // "February"
const expectedYear = date.getFullYear() // 2026

// 3. Construir string de fecha para validación
const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}` // "Feb 16, 2026"
```

**⚠️ IMPORTANTE sobre fechas:**
- **NUNCA uses fechas hardcodeadas** como `'Feb 21, 2026'`
- Siempre calcula la fecha dinámicamente basada en `new Date()`
- Si el tutorial muestra una fecha específica, es porque se grabó ese día
- Tu test debe funcionar **cualquier día que lo ejecutes**

---

### Navegar meses en el calendario

```typescript
// Obtener mes y año visible en el calendario
let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}` // "February 2026"

// Navegar hacia adelante hasta encontrar el mes correcto
while (!calendarMonthAndYear?.includes(expectedMonthAndYear)) {
    await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
    calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
}
```

**Selectores de navegación:**
- `'nb-calendar-pageable-navigation [data-name="chevron-right"]'` - Mes siguiente
- `'nb-calendar-pageable-navigation [data-name="chevron-left"]'` - Mes anterior

---

### Seleccionar día específico

```typescript
// Hacer click en el día (asegurar exact match para evitar conflictos)
await page.locator('[class="day-cell ng-star-inserted"]')
    .getByText(expectedDate, {exact: true})
    .click()

// Validar que el input tiene la fecha correcta
await expect(calendarInputField).toHaveValue(dateToAssert)
```

**Importante:** Usar `{exact: true}` para evitar seleccionar días como "1" cuando buscas "21".

---

### Ejemplo completo de datepicker

```typescript
test('datepicker', async ({page}) => {
    await page.getByText('Forms').click()
    await page.getByText('Datepicker').click()

    const calendarInputField = page.getByPlaceholder('Form Picker')
    await calendarInputField.click()

    // Calcular fecha (14 días adelante)
    let date = new Date()
    date.setDate(date.getDate() + 14)
    const expectedDate = date.getDate().toString()
    const expectedMonthShort = date.toLocaleString('en-US', {month: 'short'})
    const expectedMonthLong = date.toLocaleString('en-US', {month: 'long'})
    const expectedYear = date.getFullYear()
    const dateToAssert = `${expectedMonthShort} ${expectedDate}, ${expectedYear}`
    
    // Navegar al mes correcto
    let calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}`
    while (!calendarMonthAndYear?.includes(expectedMonthAndYear)) {
        await page.locator('nb-calendar-pageable-navigation [data-name="chevron-right"]').click()
        calendarMonthAndYear = await page.locator('nb-calendar-view-mode').textContent()
    }

    // Seleccionar día
    await page.locator('[class="day-cell ng-star-inserted"]')
        .getByText(expectedDate, {exact: true})
        .click()
    
    // Validar
    await expect(calendarInputField).toHaveValue(dateToAssert)
})
```

---

### Variaciones de fechas

```typescript
// Mañana
date.setDate(date.getDate() + 1)

// En 2 semanas
date.setDate(date.getDate() + 14)

// En 3 meses (aproximado)
date.setDate(date.getDate() + 90)

// Ayer
date.setDate(date.getDate() - 1)

// Primer día del mes siguiente
let nextMonth = new Date()
nextMonth.setMonth(nextMonth.getMonth() + 1)
nextMonth.setDate(1)
```

---

### Problemas comunes con datepickers

#### ❌ Error: Fecha hardcodeada
```typescript
// MAL - Solo funciona si ejecutas el test el 20 de junio
await expect(calendarInputField).toHaveValue('Jun 21, 2026')
```

**Solución:** Calcular la fecha dinámicamente.

---

#### ❌ Error: Selecciona el día equivocado
```typescript
// MAL - "1" también coincide con "11", "21", "31"
.getByText('1').click()

// BIEN - Exact match
.getByText('1', {exact: true}).click()
```

---

#### ❌ Error: Mes no es visible
```typescript
// MAL - Intentar click sin navegar
await page.locator('.day-cell').getByText('21').click() // Falla si estamos en febrero y necesitas junio
```

**Solución:** Navegar con el bucle `while` hasta el mes correcto.

---

#### ❌ Error: Selector incorrecto de navegación
```typescript
// Puede fallar dependiendo del componente
'nb-calendar-navigation[data-name="chevron-right"]'

// Selector correcto para Nebular
'nb-calendar-pageable-navigation [data-name="chevron-right"]'
```

---

## Resumen de Métodos

| Elemento | Acción | Método |
|----------|--------|--------|
| Input | Llenar instantáneo | `.fill()` |
| Input | Escribir con delay | `.pressSequentially()` |
| Input | Limpiar | `.clear()` |
| Input | Obtener valor | `.inputValue()` |
| Radio | Seleccionar | `.check({force: true})` |
| Radio/Checkbox | Verificar estado | `.isChecked()` |
| Checkbox | Marcar | `.check({force: true})` |
| Checkbox | Desmarcar | `.uncheck({force: true})` |
| Checkbox | Toggle | `.click()` |
| Dropdown | Abrir | `.click()` |
| Lista | Seleccionar opción | `.filter({hasText: 'text'}).click()` |
| Tooltip | Mostrar | `.hover()` |
| Dialog | Aceptar | `dialog.accept()` |
| Dialog | Rechazar | `dialog.dismiss()` |
| Tabla | Seleccionar fila | `getByRole('row', {name: 'text'})` |
| Tabla | Columna específica | `.locator('td').nth(index)` |

---

## Sliders (Deslizadores)

Los sliders son controles que requieren manipulación avanzada, ya que pueden necesitar actualizar atributos directamente o simular movimiento del mouse.

### Método 1: Actualizar atributos directamente

```typescript
const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')

// Modificar atributos SVG directamente
await tempGauge.evaluate((node) => {
    node.setAttribute('cx', '232.630')
    node.setAttribute('cy', '232.630')
})

await tempGauge.click()
```

**Cuándo usar:** Cuando el slider es un elemento SVG o necesitas establecer un valor exacto sin simular el arrastre.

---

### Método 2: Simular movimiento del mouse (Drag and Drop)

```typescript
const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')

// 1. Asegurar que el elemento es visible
await tempBox.scrollIntoViewIfNeeded()

// 2. Obtener dimensiones y posición del elemento
const box = await tempBox.boundingBox()
if (!box) return // Verificar que el elemento tiene dimensiones

// 3. Calcular el centro del elemento
const x = box.x + box.width / 2
const y = box.y + box.height / 2

// 4. Simular arrastre del mouse
await page.mouse.move(x, y)           // Mover al centro
await page.mouse.down()               // Presionar botón del mouse
await page.mouse.move(x + 100, y)     // Mover a la derecha
await page.mouse.move(x + 100, y + 100) // Mover abajo
await page.mouse.up()                 // Soltar botón del mouse

// 5. Validar resultado
await expect(tempBox).toContainText('30')
```

**Importante:**
- `boundingBox()` retorna `null` si el elemento no es visible
- Siempre verificar con `if (!box) return` o usar non-null assertion `box!`
- `scrollIntoViewIfNeeded()` garantiza que el elemento sea visible

---

### Componentes del bounding box

```typescript
const box = await element.boundingBox()
// box contiene:
// - box.x: Coordenada X (izquierda)
// - box.y: Coordenada Y (arriba)
// - box.width: Ancho del elemento
// - box.height: Alto del elemento
```

**Calcular posiciones:**
```typescript
// Centro
const centerX = box.x + box.width / 2
const centerY = box.y + box.height / 2

// Esquina superior izquierda
const topLeftX = box.x
const topLeftY = box.y

// Esquina inferior derecha
const bottomRightX = box.x + box.width
const bottomRightY = box.y + box.height
```

---

### Métodos de mouse

| Método | Descripción |
|--------|-------------|
| `page.mouse.move(x, y)` | Mover cursor a coordenadas |
| `page.mouse.down()` | Presionar botón del mouse |
| `page.mouse.up()` | Soltar botón del mouse |
| `page.mouse.click(x, y)` | Click en coordenadas |
| `page.mouse.dblclick(x, y)` | Doble click |

---

### Ejemplo completo de slider

```typescript
test('sliders', async ({page}) => {
    await page.getByText('IoT Dashboard').click()
    
    // Método 1: Actualizar atributos
    const tempGauge = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger circle')
    await tempGauge.evaluate((node) => {
        node.setAttribute('cx', '232.630')
        node.setAttribute('cy', '232.630')
    })
    await tempGauge.click()

    // Método 2: Simular arrastre
    const tempBox = page.locator('[tabtitle="Temperature"] ngx-temperature-dragger')
    await tempBox.scrollIntoViewIfNeeded()

    const box = await tempBox.boundingBox()
    if (!box) return
    
    const x = box.x + box.width / 2
    const y = box.y + box.height / 2
    
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + 100, y)       // Mover 100px a la derecha
    await page.mouse.move(x + 100, y + 100) // Mover 100px abajo
    await page.mouse.up()
    
    await expect(tempBox).toContainText('30')
})
```

---

### Alternativa: Método `dragTo()`

Playwright también ofrece un método más simple para drag and drop:

```typescript
const slider = page.locator('.slider-handle')
const target = page.locator('.target-position')

// Arrastrar desde el slider hasta el target
await slider.dragTo(target)
```

**Limitación:** No siempre funciona con sliders personalizados, por eso el método manual con `page.mouse` es más confiable.

---

### Problemas comunes con sliders

#### ❌ Error: box is possibly null

```typescript
const box = await element.boundingBox()
const x = box.x // Error de TypeScript
```

**Solución:**
```typescript
// Opción 1: Verificar null
const box = await element.boundingBox()
if (!box) return
const x = box.x // OK

// Opción 2: Non-null assertion
const box = await element.boundingBox()
const x = box!.x // Le dice a TS que confíe que no es null
```

---

#### ❌ Error: Elemento no visible

```typescript
const box = await element.boundingBox()
// box = null porque el elemento está fuera de vista
```

**Solución:**
```typescript
await element.scrollIntoViewIfNeeded()
const box = await element.boundingBox()
```

---

#### ❌ Error: Movimiento impreciso

```typescript
// No calcula el centro correctamente
await page.mouse.move(box.x, box.y) // Esquina, no centro
```

**Solución:**
```typescript
// Calcular el centro del elemento
const x = box.x + box.width / 2
const y = box.y + box.height / 2
await page.mouse.move(x, y)
```

---

## Buenas Prácticas

### ✅ Hacer

```typescript
// Usar locator assertions (espera automática)
await expect(element).toBeChecked()
await expect(element).toHaveValue('text')

// check() para marcar, uncheck() para desmarcar
await checkbox.check({force: true})

// Object.entries() para iterar objetos
for (const [key, value] of Object.entries(obj)) { }

// Configurar listeners ANTES de la acción
page.on('dialog', handler)
await action()
```

### ❌ Evitar

```typescript
// Generic assertions sin espera
expect(await element.isChecked()).toBeTruthy()

// click() cuando quieres garantizar un estado
await checkbox.click() // Puede estar ya marcado

// for...in con TypeScript sin type assertion
for (const key in obj) { obj[key] } // Error de TS

// Listener después de la acción
await action()
page.on('dialog', handler) // Ya es tarde
```
