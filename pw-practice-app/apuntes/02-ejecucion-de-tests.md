# 🚀 Ejecución de Tests

## Comandos básicos de ejecución

| Comando | Descripción |
|---------|-------------|
| `npx playwright test` | Ejecuta todos los tests en todos los navegadores |
| `npx playwright test example.spec.ts` | Ejecuta un archivo específico |
| `npx playwright test --project=chromium` | Ejecuta solo en un navegador específico |
| `npx playwright test -g "has title"` | Ejecuta tests que coincidan con el patrón |

---

## Modos de visualización

### 🖥️ Modo Headed (ver en navegador)
```bash
npx playwright test --project=chromium --headed
```
- Los tests se ejecutan con la ventana del navegador visible
- Útil para ver qué está pasando en tiempo real

---

### 📊 Modo UI (interfaz gráfica)
```bash
npx playwright test --ui
```
**Características:**
- Interfaz gráfica interactiva para ejecutar tests
- Selector de navegadores (chromium, firefox, webkit)
- Vista de pasos en tiempo real
- Timeline y capturas de pantalla
- Ejecutar tests individuales o en lote
- Ver tests en tiempo real mientras se ejecutan

---

### 🐛 Modo Debug
```bash
npx playwright test --debug
npx playwright test --project=chromium --debug
```
**Características:**
- Abre **Playwright Inspector**
- Ejecución paso a paso (step by step)
- Pausar y avanzar línea por línea
- Selector picker para identificar elementos
- Ver locators y acciones en tiempo real
- Consola del inspector para comandos
- Resalta la línea actual del código

---

### 📸 Con Trace Activado
```bash
npx playwright test --project=chromium --trace on
```
- Fuerza la generación de trace para todos los tests
- Genera reportes con imágenes y capturas de pantalla
- Muestra screenshots, network, console logs
- Ver después con `npx playwright show-report`

---

## Ver reportes
```bash
npx playwright show-report
```
Abre el reporte HTML de la última ejecución con:
- Resumen de tests pasados/fallidos
- Detalles de cada test
- Traces (si están disponibles)
- Screenshots y videos (si se configuraron)

---

## 🔧 Herramientas Adicionales

### Extensión de Playwright para VS Code

Funcionalidades probadas:
- ✅ Ejecutar tests directamente desde el editor (sin terminal)
- ✅ Interfaz gráfica integrada en VS Code
- ✅ Ejecutar en todos los navegadores a la vez
- ✅ Ejecutar en navegadores individuales (chromium, firefox, webkit)
- ✅ Ver resultados de forma visual e interactiva
- ✅ Modo UI sin salir del editor

---

### Tests de ejemplo

#### example.spec.ts
Test de ejemplo incluido en la instalación que se puede usar para:
- Probar diferentes formas de ejecución
- Experimentar con `skip` para saltar tests
- Experimentar con `only` para ejecutar tests específicos

---

[⬅️ Anterior: Instalación](01-instalacion-y-configuracion.md) | [Volver al índice](README.md) | [Siguiente: Estructura de Tests ➡️](03-estructura-de-tests.md)
