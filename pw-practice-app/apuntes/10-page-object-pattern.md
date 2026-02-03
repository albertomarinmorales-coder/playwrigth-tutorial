# Page Object Pattern (POM) - Guía Completa

## 📚 Índice
1. [¿Qué es el Page Object Pattern?](#qué-es-el-page-object-pattern)
2. [¿Por qué usar Page Objects?](#por-qué-usar-page-objects)
3. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
4. [Conceptos Fundamentales](#conceptos-fundamentales)
5. [Clases del Proyecto](#clases-del-proyecto)
6. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
7. [Mejores Prácticas](#mejores-prácticas)
8. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## ¿Qué es el Page Object Pattern?

El **Page Object Pattern (POM)** es un patrón de diseño en automatización de pruebas que consiste en crear una **clase por cada página o sección** de la aplicación web. Cada clase encapsula los elementos y las acciones que se pueden realizar en esa página.

### Analogía
Piensa en cada Page Object como un **manual de instrucciones** de una habitación:
- **Habitación** = Página web
- **Manual** = Page Object (clase)
- **Instrucciones** = Métodos (acciones)
- **Objeto real** = Instancia del Page Object

---

## ¿Por qué usar Page Objects?

### ❌ Sin Page Objects (Código Repetitivo)
```typescript
test('test 1', async ({page}) => {
    await page.goto('http://localhost:4200');
    await page.getByTitle('Forms').click();
    await page.getByText('Form Layouts').click();
    await page.locator('nb-card:has-text("Using the Grid")').getByRole('textbox', {name: 'Email'}).fill('test@test.com');
    // 20 líneas más...
});

test('test 2', async ({page}) => {
    await page.goto('http://localhost:4200');
    await page.getByTitle('Forms').click();
    await page.getByText('Form Layouts').click();
    // MISMO CÓDIGO REPETIDO
});
```

**Problemas:**
- Código duplicado en múltiples tests
- Si cambia un selector, debes actualizar TODOS los tests
- Tests difíciles de leer y mantener
- Mezcla de lógica de test y de navegación

### ✅ Con Page Objects (Código Reutilizable)
```typescript
test('test 1', async ({page}) => {
    const pm = new PageManager(page);
    await pm.navigateTo().formLayoutsPage();
    await pm.formLayouts().submitForm('test@test.com', 'password');
});

test('test 2', async ({page}) => {
    const pm = new PageManager(page);
    await pm.navigateTo().formLayoutsPage();
    await pm.formLayouts().submitForm('otro@test.com', 'otra-pass');
});
```

**Ventajas:**
- ✅ Código limpio y legible
- ✅ Reutilización máxima
- ✅ Fácil mantenimiento (cambias una clase, no 50 tests)
- ✅ Separación de responsabilidades
- ✅ Tests más robustos

---

## Arquitectura del Proyecto

```
pw-practice-app/
├── page-objects/
│   ├── helperBase.ts           ← Clase base con utilidades compartidas
│   ├── pageManager.ts          ← Manager central (Facade Pattern)
│   ├── navigationsPage.ts      ← Page Object para navegación
│   ├── formLayoutsPage.ts      ← Page Object para formularios
│   └── datePickerPage.ts       ← Page Object para calendarios
└── tests/
    └── userPageObjects.spec.ts ← Tests usando Page Objects
```

### Jerarquía de Clases

```
HelperBase (clase base)
    ↓ extends
    ├── NavigationPage
    ├── FormLayoutsPage
    └── DatePickerPage
    
PageManager (gestiona todos los Page Objects)
```

---

## Conceptos Fundamentales

### 1. Clase vs Instancia vs Método

```typescript
// CLASE: Plano/diseño (no funcional hasta instanciar)
export class FormLayoutsPage {
    private page: Page;
    
    // CONSTRUCTOR: Ensambla el objeto con valores reales
    constructor(page: Page) {
        this.page = page;  // Guarda 'page' para usarlo después
    }
    
    // MÉTODO: Acción que el objeto puede realizar
    async submitForm(email: string, password: string) {
        await this.page.fill(..., email);
    }
}

// INSTANCIA: Objeto funcional creado a partir de la clase
const formPage = new FormLayoutsPage(page);  // ← Aquí se ejecuta el constructor

// LLAMADA A MÉTODO: Ejecutar la acción con valores específicos
await formPage.submitForm('test@test.com', 'password');  // ← Aquí se pasan valores
```

**Flujo:**
1. **Clase** → Define estructura (plano del coche)
2. **Constructor** → Ensambla con valores reales (construye el coche)
3. **Instancia** → Objeto funcional (`new ...`) (coche construido)
4. **Método** → Acción que realiza (conducir el coche)

### 2. El Rol de `page` en Playwright

```typescript
test('test', async ({page}) => {  // ← Playwright INYECTA 'page' aquí
    // 'page' es el navegador - tu conexión con la web
});
```

**¿Qué es `page`?**
- Es un **objeto de Playwright** que representa el navegador
- Contiene métodos como `.goto()`, `.click()`, `.fill()`, `.locator()`, etc.
- Es **OBLIGATORIO** en Page Objects porque sin él no puedes interactuar con la web

**¿Por qué siempre está en el constructor?**
```typescript
constructor(page: Page) {
    this.page = page;  // OBLIGATORIO: guardar 'page' para usarlo en métodos
}
```

Sin `page`, los métodos no podrían hacer clicks, llenar formularios ni nada.

### 3. Encapsulación

```typescript
export class FormLayoutsPage {
    // ENCAPSULACIÓN: Guarda 'page' internamente
    private page: Page;
    
    constructor(page: Page) {
        this.page = page;  // Ahora TODOS los métodos pueden usar 'this.page'
    }
    
    async submitForm(...) {
        this.page.locator(...)  // ← Usa el 'page' encapsulado
    }
}
```

**Regla de oro:** En Playwright, **SIEMPRE** necesitas encapsular `page` en el constructor.

### 4. Herencia con `extends`

```typescript
// CLASE BASE
export class HelperBase {
    readonly page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }
    
    async waitForNumerOfSeconds(seconds: number) {
        await this.page.waitForTimeout(seconds * 1000);
    }
}

// CLASE HIJA
export class NavigationPage extends HelperBase {
    constructor(page: Page) {
        super(page);  // Llama al constructor de HelperBase
    }
    
    async formLayoutsPage() {
        this.waitForNumerOfSeconds(2);  // ← Usa método heredado
        await this.page.getByText('Form Layouts').click();
    }
}
```

**Ventajas:**
- Evita duplicar código (método `waitForNumerOfSeconds` está en una sola clase)
- Todas las clases hijas heredan los métodos de la base
- Facilita añadir nuevas utilidades comunes

### 5. Métodos Privados vs Públicos

```typescript
export class NavigationPage {
    // PÚBLICO: Los tests pueden llamarlo
    async formLayoutsPage() {
        await this.selectGroupMenuItem('Forms');  // ← Llama al privado
        await this.page.getByText('Form Layouts').click();
    }
    
    // PRIVADO: Solo se usa internamente
    private async selectGroupMenuItem(title: string) {
        const menu = this.page.getByTitle(title);
        const expanded = await menu.getAttribute('aria-expanded');
        if (expanded === 'false') {
            await menu.click();
        }
    }
}
```

**¿Por qué privado?**
- Encapsula lógica compleja que los tests no necesitan conocer
- Evita que los tests usen métodos internos que pueden cambiar
- Mantiene la API pública simple y clara

---

## Clases del Proyecto

### 1. HelperBase (Clase Base)

**Archivo:** `helperBase.ts`

```typescript
import {Page} from '@playwright/test';

export class HelperBase {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async waitForNumerOfSeconds(timeInSeconds: number) {
        await this.page.waitForTimeout(timeInSeconds * 1000);
    }
}
```

**Propósito:**
- Clase base que proporciona funcionalidad común a TODOS los Page Objects
- Implementa el patrón **Base Class** o **Parent Class**
- Almacena `page` para que las clases hijas puedan acceder

**¿Por qué existe?**
- Evitar duplicar el código del constructor en cada Page Object
- Centralizar métodos utilitarios compartidos
- Facilitar la extensión futura (añades un método aquí, todos lo heredan)

**¿Cuándo se usa?**
- Todas las clases Page Object heredan de `HelperBase` usando `extends`

---

### 2. NavigationPage (Navegación del Menú)

**Archivo:** `navigationsPage.ts`

```typescript
export class NavigationPage extends HelperBase {
    constructor(page: Page) { 
        super(page);  // ← Llama al constructor de HelperBase
    }

    async formLayoutsPage() {
        await this.selectGroupMenuItem('Forms');
        await this.page.getByText('Form Layouts').click();
        await this.waitForNumerOfSeconds(2);
    }

    async datepickerPage() {
        await this.selectGroupMenuItem('Forms');
        await this.page.getByText('Datepicker').click();
    }

    // Métodos para: smartTablePage, toastrPage, tooltipPage...

    private async selectGroupMenuItem(groupItemTitle: string) {
        const groupMenuItem = this.page.getByTitle(groupItemTitle);
        const expandedState = await groupMenuItem.getAttribute('aria-expanded');
        if (expandedState === 'false') {
            await groupMenuItem.click();
        } 
    }
}
```

**Propósito:**
- Gestionar la navegación por el menú lateral de la aplicación
- Encapsular la lógica de expandir/colapsar menús

**Métodos públicos:**
- `formLayoutsPage()` - Navega a Form Layouts
- `datepickerPage()` - Navega a Datepicker
- `smartTablePage()` - Navega a Smart Table
- `toastrPage()` - Navega a Toastr
- `tooltipPage()` - Navega a Tooltip

**Método privado:**
- `selectGroupMenuItem()` - Expande el grupo del menú si está colapsado

**¿Por qué `selectGroupMenuItem` es privado?**
- Es un detalle de implementación interno
- Los tests no necesitan saber cómo se expanden los menús
- Mantiene la API pública simple

---

### 3. FormLayoutsPage (Formularios)

**Archivo:** `formLayoutsPage.ts`

```typescript
export class FormLayoutsPage extends HelperBase {
    constructor(page: Page) {
        super(page);
    }

    async submitUsingTheGridFromWithCredentialsAndSelectOption(
        email: string, 
        password: string, 
        optionText: string
    ) {
        const form = this.page.locator('nb-card:has-text("Using the Grid")');
        await form.getByRole('textbox', {name: 'Email'}).fill(email);
        await form.getByRole('textbox', {name: 'Password'}).fill(password);
        await form.getByRole('radio', {name: optionText}).check({force: true});
        await form.getByRole('button').click();
    }

    async submitInlineFormWithNameEmailAndCheckbox(
        name: string, 
        email: string, 
        rememberMe: boolean
    ) {
        const form = this.page.locator('nb-card', {hasText: "Inline form"});
        await form.getByRole('textbox', {name: 'Jane Doe'}).fill(name);
        await form.getByRole('textbox', {name: 'Email'}).fill(email);
        if (rememberMe) {
            await form.getByLabel('Remember me').check({force: true});
        } else {
            await form.getByLabel('Remember me').uncheck({force: true});
        }
        await form.getByRole('button').click();
    }
}
```

**Propósito:**
- Interactuar con los formularios de la página Form Layouts
- Encapsular la lógica de llenado y envío de formularios

**Métodos:**
- `submitUsingTheGridFrom...()` - Rellena y envía el formulario "Using the Grid"
- `submitInlineForm...()` - Rellena y envía el formulario "Inline"

**Parámetros:**
Los métodos reciben parámetros para **reutilización con diferentes datos**:
```typescript
// Mismo método, diferentes datos
await formPage.submitForm('user1@test.com', 'pass1');
await formPage.submitForm('user2@test.com', 'pass2');
```

---

### 4. DatePickerPage (Calendarios)

**Archivo:** `datePickerPage.ts`

```typescript
export class DatePickerPage extends HelperBase {
    constructor(page: Page) {
        super(page);
    }
    
    async selectCommonDatePickerDateFromToday(numberOfDaysFromToday: number) {
        const calendarInputField = this.page.getByPlaceholder('Form Picker');
        await calendarInputField.click();
        const dateToAssert = await this.selectDateInTheCalendar(numberOfDaysFromToday);
        await expect(calendarInputField).toHaveValue(dateToAssert);
    }

    async selectDatePickerWithRangeFromToday(startDay: number, endDay: number) {
        const calendarInputField = this.page.getByPlaceholder('Range Picker');
        await calendarInputField.click();
        const dateStart = await this.selectDateInTheCalendar(startDay);
        const dateEnd = await this.selectDateInTheCalendar(endDay);
        await expect(calendarInputField).toHaveValue(`${dateStart} - ${dateEnd}`);
    }

    private async selectDateInTheCalendar(numberOfDaysFromToday: number) {
        let date = new Date();
        date.setDate(date.getDate() + numberOfDaysFromToday);
        
        const expectedDate = date.getDate().toString();
        const expectedMonth = date.toLocaleString('en-US', {month: 'long'});
        const expectedYear = date.getFullYear();
        
        // Navega por meses hasta encontrar el correcto
        let currentMonth = await this.page.locator('nb-calendar-view-mode').textContent();
        const targetMonth = `${expectedMonth} ${expectedYear}`;
        
        while (!currentMonth?.includes(targetMonth)) {
            await this.page.locator('[data-name="chevron-right"]').click();
            currentMonth = await this.page.locator('nb-calendar-view-mode').textContent();
        }
        
        await this.page.locator('.day-cell').getByText(expectedDate, {exact: true}).click();
        return `${date.toLocaleString('en-US', {month: 'short'})} ${expectedDate}, ${expectedYear}`;
    }
}
```

**Propósito:**
- Seleccionar fechas en calendarios de forma programática
- Calcular fechas relativas al día actual

**Métodos públicos:**
- `selectCommonDatePickerDateFromToday(days)` - Selecciona fecha simple
- `selectDatePickerWithRangeFromToday(start, end)` - Selecciona rango de fechas

**Método privado:**
- `selectDateInTheCalendar(days)` - Lógica compartida para navegar y seleccionar

**Características:**
- Calcula fechas futuras/pasadas automáticamente
- Navega por meses del calendario hasta encontrar el correcto
- Verifica que el valor seleccionado sea el esperado

---

### 5. PageManager (Clase Central)

**Archivo:** `pageManager.ts`

```typescript
export class PageManager {
    private readonly page: Page;
    private readonly navigationPage: NavigationPage;
    private readonly formLayoutsPage: FormLayoutsPage;
    private readonly datePickerPage: DatePickerPage;

    constructor(page: Page) {
        this.page = page;
        this.navigationPage = new NavigationPage(this.page);
        this.formLayoutsPage = new FormLayoutsPage(this.page);
        this.datePickerPage = new DatePickerPage(this.page);
    }

    navigateTo() {
        return this.navigationPage;
    }
    
    formLayouts() {
        return this.formLayoutsPage;
    }
    
    datePicker() {
        return this.datePickerPage;
    }
}
```

**Propósito:**
- **Clase Facade**: Punto de entrada único para todos los Page Objects
- Gestiona la creación e instanciación de todos los Page Objects
- Simplifica el uso en tests

**¿Por qué existe?**

### Sin PageManager (Repetitivo):
```typescript
test('test', async ({page}) => {
    const nav = new NavigationPage(page);
    const formPage = new FormLayoutsPage(page);
    const datePicker = new DatePickerPage(page);
    // Repetir en CADA test
});
```

### Con PageManager (Simple):
```typescript
test('test', async ({page}) => {
    const pm = new PageManager(page);  // ← Una sola instancia
    await pm.navigateTo().formLayoutsPage();
    await pm.formLayouts().submitForm(...);
});
```

**Ventajas:**
- ✅ Una sola línea para acceder a todos los Page Objects
- ✅ Todos comparten la misma instancia de `page`
- ✅ Código más limpio en los tests
- ✅ Fácil de extender (añades un nuevo Page Object aquí)

**Patrón de Diseño:** Facade Pattern (proporciona interfaz simplificada)

---

## Flujo de Trabajo Completo

### Paso a Paso del Flujo

```typescript
test('parametrized methods', async ({page}) => {  // ← 1. Playwright inyecta 'page'
    const pm = new PageManager(page);              // ← 2. Creas PageManager
    
    await pm.navigateTo().formLayoutsPage();       // ← 3. Usas método de navegación
    await pm.formLayouts().submitForm(...);         // ← 4. Usas método de formulario
});
```

### Desglose Detallado:

#### 1. Playwright Inyecta `page`
```typescript
test('test', async ({page}) => {
    // Playwright crea automáticamente 'page' (el navegador)
});
```

#### 2. Crear PageManager
```typescript
const pm = new PageManager(page);
```
**Lo que sucede internamente:**
```typescript
// Se ejecuta el constructor de PageManager:
constructor(page: Page) {
    this.page = page;
    this.navigationPage = new NavigationPage(this.page);  // ← Crea NavigationPage
    this.formLayoutsPage = new FormLayoutsPage(this.page); // ← Crea FormLayoutsPage
    this.datePickerPage = new DatePickerPage(this.page);   // ← Crea DatePickerPage
}
```

#### 3. Llamar Métodos
```typescript
await pm.navigateTo().formLayoutsPage();
```
**Desglose:**
1. `pm.navigateTo()` → Devuelve `this.navigationPage` (instancia de NavigationPage)
2. `.formLayoutsPage()` → Llama al método `formLayoutsPage()` de NavigationPage
3. Dentro del método:
   ```typescript
   async formLayoutsPage() {
       await this.selectGroupMenuItem('Forms');  // Expande menú
       await this.page.getByText('Form Layouts').click();  // Click
       await this.waitForNumerOfSeconds(2);  // Espera
   }
   ```

#### 4. Pasar Parámetros
```typescript
await pm.formLayouts().submitForm('test@test.com', 'password', 'Option 2');
```
**Flujo de valores:**
1. Test pasa valores: `'test@test.com'`, `'password'`, `'Option 2'`
2. Método recibe en parámetros:
   ```typescript
   async submitForm(email: string, password: string, option: string) {
       await form.fill(..., email);     // ← Usa 'test@test.com'
       await form.fill(..., password);   // ← Usa 'password'
       await form.check(..., option);    // ← Usa 'Option 2'
   }
   ```

---

## Mejores Prácticas

### 1. Convención de Nombres

```typescript
// ✅ BIEN
export class FormLayoutsPage { }      // Clase: PascalCase
const formPage = new FormLayoutsPage(); // Instancia: camelCase

// ❌ MAL
export class formLayoutsPage { }
const FormLayoutsPage = new FormLayoutsPage(); // Confuso
```

### 2. Un Page Object por Página

```
✅ Estructura correcta:
- loginPage.ts          → Página de login
- dashboardPage.ts      → Dashboard
- formLayoutsPage.ts    → Form Layouts

❌ Estructura incorrecta:
- allPages.ts           → TODO en un archivo (mal)
```

### 3. Métodos Descriptivos

```typescript
// ✅ BIEN
async submitUsingTheGridFromWithCredentialsAndSelectOption(...)
async selectCommonDatePickerDateFromToday(...)

// ❌ MAL
async submit(...)  // ¿Qué formulario?
async select(...)  // ¿Qué selecciona?
```

### 4. Evitar Lógica en Tests

```typescript
// ❌ MAL (lógica en test)
test('test', async ({page}) => {
    await page.locator('nb-card:has-text("Using the Grid")').getByRole('textbox').fill('email');
    if (condition) {
        await page.click('...');
    }
});

// ✅ BIEN (lógica en Page Object)
test('test', async ({page}) => {
    const pm = new PageManager(page);
    await pm.formLayouts().submitForm('email', 'password');
});
```

### 5. Usar `readonly` para Inmutabilidad

```typescript
export class PageManager {
    private readonly page: Page;  // ← No se puede reasignar
    private readonly navigationPage: NavigationPage;
}
```

### 6. Documentar Métodos Complejos

```typescript
/**
 * Selecciona una fecha en el calendario relativa al día actual.
 * @param numberOfDaysFromToday - Días desde hoy (positivo=futuro, negativo=pasado)
 * @example
 * await datePicker.selectDate(10);  // 10 días en el futuro
 * await datePicker.selectDate(-5);  // 5 días en el pasado
 */
async selectCommonDatePickerDateFromToday(numberOfDaysFromToday: number) { }
```

---

## Ejemplos Prácticos

### Ejemplo 1: Test de Navegación

```typescript
test('navigate to different pages', async ({page}) => {
    const pm = new PageManager(page);

    // Navegar a diferentes secciones
    await pm.navigateTo().formLayoutsPage();
    await pm.navigateTo().datepickerPage();
    await pm.navigateTo().smartTablePage();
    await pm.navigateTo().toastrPage();
    await pm.navigateTo().tooltipPage();
});
```

**¿Qué hace?**
- Crea un PageManager
- Usa el método `navigateTo()` para obtener NavigationPage
- Llama a diferentes métodos de navegación

### Ejemplo 2: Test Parametrizado

```typescript
test('parametrized form submission', async ({page}) => {
    const pm = new PageManager(page);

    await pm.navigateTo().formLayoutsPage();
    
    // Formulario 1: Grid form
    await pm.formLayouts().submitUsingTheGridFromWithCredentialsAndSelectOption(
        'test@test.com', 
        'password123', 
        'Option 2'
    );
    
    // Formulario 2: Inline form
    await pm.formLayouts().submitInlineFormWithNameEmailAndCheckbox(
        'John Doe', 
        'john.doe@example.com', 
        true
    );
});
```

**¿Qué hace?**
- Navega a Form Layouts
- Rellena el formulario "Using the Grid"
- Rellena el formulario "Inline"
- Usa diferentes datos para cada formulario

### Ejemplo 3: Test con Fechas

```typescript
test('date picker selection', async ({page}) => {
    const pm = new PageManager(page);

    await pm.navigateTo().datepickerPage();
    
    // Seleccionar fecha 214 días en el futuro
    await pm.datePicker().selectCommonDatePickerDateFromToday(214);
    
    // Seleccionar rango de fechas
    await pm.datePicker().selectDatePickerWithRangeFromToday(214, 220);
});
```

**¿Qué hace?**
- Navega a la página de Datepicker
- Selecciona una fecha simple
- Selecciona un rango de fechas

### Ejemplo 4: Test Completo (E2E)

```typescript
test('complete user flow', async ({page}) => {
    const pm = new PageManager(page);

    // 1. Navegar a formularios
    await pm.navigateTo().formLayoutsPage();
    
    // 2. Llenar formulario
    await pm.formLayouts().submitInlineFormWithNameEmailAndCheckbox(
        'John Doe',
        'john@test.com',
        true
    );
    
    // 3. Navegar a datepicker
    await pm.navigateTo().datepickerPage();
    
    // 4. Seleccionar fecha
    await pm.datePicker().selectCommonDatePickerDateFromToday(10);
    
    // 5. Navegar a otra sección
    await pm.navigateTo().smartTablePage();
});
```

---

## Resumen de Conceptos Clave

### 1. El Constructor NO es "relleno" de los métodos
- **Constructor**: Inicializa y guarda valores (prepara herramientas)
- **Métodos**: Usan esos valores guardados (usan las herramientas)

### 2. Los parámetros se pasan al LLAMAR el método
```typescript
const formPage = new FormLayoutsPage(page);  // ← Solo 'page'
await formPage.submitForm('email', 'pass');   // ← Valores aquí
```

### 3. `page` SIEMPRE debe estar en Playwright
- Sin `page`, no puedes interactuar con el navegador
- Se encapsula en el constructor
- Se usa en todos los métodos

### 4. Instanciar es simple pero CRÍTICO
```typescript
const pm = new PageManager(page);  // ← Una línea, pero crucial
```
Sin esta línea, las clases son código muerto.

### 5. Regla: 1 Objeto = 1 Página
```
loginPage.ts       → Página de login
dashboardPage.ts   → Dashboard
formLayoutsPage.ts → Form Layouts
```

### 6. PageManager = Facade (simplifica acceso)
```typescript
const pm = new PageManager(page);
await pm.navigateTo().formLayoutsPage();  // ← Simple y claro
```

---

## Diagrama de Flujo Visual

```
TEST
  ↓
  ├─ Playwright inyecta 'page'
  ↓
  ├─ const pm = new PageManager(page)
  │    ↓
  │    ├─ Constructor crea NavigationPage
  │    ├─ Constructor crea FormLayoutsPage
  │    └─ Constructor crea DatePickerPage
  ↓
  ├─ await pm.navigateTo().formLayoutsPage()
  │    ↓
  │    ├─ navigateTo() devuelve NavigationPage
  │    └─ formLayoutsPage() ejecuta acciones
  ↓
  ├─ await pm.formLayouts().submitForm('email', 'pass')
  │    ↓
  │    ├─ formLayouts() devuelve FormLayoutsPage
  │    └─ submitForm() ejecuta acciones con parámetros
  ↓
FIN
```

---

## Conclusión

El **Page Object Pattern** es fundamental para escribir tests mantenibles y escalables. Al encapsular la lógica de interacción con la UI en clases reutilizables, logras:

✅ Código más limpio y legible  
✅ Mayor reutilización  
✅ Mantenimiento simplificado  
✅ Tests más robustos  
✅ Mejor separación de responsabilidades  

**Recuerda:** Un Page Object es como un "mando a distancia" especializado para cada página de tu aplicación.
