# 🐞 Problemas y Soluciones

## Errores comunes

### Error: PowerShell no permite ejecutar npm

**Problema:**
```
No se puede cargar el archivo npm.ps1 porque la ejecución de scripts está deshabilitada
```

**Solución:**
1. Cambiar a terminal bash
2. O ejecutar en PowerShell como administrador:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Error: npm start no funciona en la raíz del proyecto

**Problema:**
El `package.json` de la raíz no tiene script "start" definido.

**Solución:**
- Navegar a la carpeta de la aplicación: `cd pw-practice-app && npm start`
- O agregar script en el `package.json` raíz:
```json
"scripts": {
  "start": "cd pw-practice-app && npm start"
}
```

---

### Test falla sin async/await

**Problema:**
El test termina antes de que las operaciones asíncronas completen.

**Solución:**
Usar `async/await` en todas las operaciones que retornan Promesas:
```typescript
// ❌ Incorrecto
test('test', ({page}) => {
    page.goto('http://localhost:4200/')
})

// ✅ Correcto
test('test', async({page}) => {
    await page.goto('http://localhost:4200/')
})
```

---

### Elemento fuera del viewport o no visible

**Problema:**
El test falla al intentar hacer clic en un elemento que existe en el DOM pero no está visible o está fuera del área visible de la pantalla.

**Causa:**
- El elemento está más abajo en la página y necesita scroll
- El elemento aún está cargando o animándose
- El elemento está oculto por CSS

**Solución 1: Playwright hace scroll automático**
Playwright automáticamente hace scroll al elemento antes de hacer clic, pero a veces necesita tiempo:

```typescript
// Asegúrate de usar await
await page.getByTestId('TestId').click()
```

**Solución 2: Esperar que el elemento sea visible**
```typescript
// Espera explícita a que el elemento sea visible
await page.getByTestId('TestId').waitFor({ state: 'visible' })
await page.getByTestId('TestId').click()
```

**Solución 3: Scroll manual (rara vez necesario)**
```typescript
await page.getByTestId('TestId').scrollIntoViewIfNeeded()
await page.getByTestId('TestId').click()
```

**Tip:** El orden de las acciones en el test importa. Asegúrate de que el `beforeEach` navegue correctamente a la página antes de interactuar con elementos.

---

### Error: net::ERR_CONNECTION_REFUSED

**Problema:**
```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:4200/
```

**Causa:**
La aplicación Angular no está corriendo cuando Playwright intenta conectarse.

**Solución 1: Dos terminales (manual)**
```bash
# Terminal 1 - Inicia la aplicación
cd pw-practice-app
npm start

# Terminal 2 - Ejecuta los tests
npx playwright test --ui
```

**Solución 2: Configuración automática (recomendado) ✅**

Edita `playwright.config.ts` y agrega:
```typescript
export default defineConfig({
  // ... resto de configuración
  
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

**¿Qué hace?**
- ✅ Playwright inicia automáticamente el servidor antes de los tests
- ✅ Espera a que esté disponible en `localhost:4200`
- ✅ Reutiliza el servidor si ya está corriendo
- ✅ Solo necesitas un comando: `npx playwright test`

---

[⬅️ Anterior: Selectores y Acciones](04-selectores-assertions-acciones.md) | [Volver al índice](README.md)
