# 📦 Instalación y Configuración

## Instalación del proyecto

```bash
npm init playwright@latest
```

Este comando:
- Instala Playwright y sus dependencias
- Crea la estructura básica del proyecto
- Configura los archivos necesarios (`playwright.config.ts`, carpeta `tests/`)
- Genera un test de ejemplo (`example.spec.ts`)

---

## Estructura del proyecto

```
demo-test/
├── playwright.config.ts    # Configuración principal
├── tests/                  # Carpeta de tests
│   └── example.spec.ts    # Test de ejemplo
└── package.json
```

---

## playwright.config.ts

Archivo de configuración principal donde se define:
- Directorio de tests (`testDir`)
- Navegadores a utilizar (chromium, firefox, webkit)
- Configuración de ejecución en paralelo
- Reportes
- Configuración de trace

---

## Configuración del Trace

En `playwright.config.ts`, sección `use`, se encuentra:
```typescript
trace: 'on-first-retry'
```

### Valores posibles del trace:

| Valor | Descripción | Cuándo usar |
|-------|-------------|-------------|
| `'off'` | No genera trace nunca | Ejecución rápida sin debugging |
| `'on'` | Genera trace en TODOS los tests | Debugging intensivo (consume más recursos) |
| `'on-first-retry'` | Solo en el primer reintento de tests fallidos | **Recomendado** - Balance entre información y performance |
| `'retain-on-failure'` | Mantiene trace solo si el test falla | Para análisis post-mortem |

### ¿Qué incluye el trace?
- Screenshots de cada paso
- Network requests
- Console logs
- DOM snapshots
- Timing de cada acción

---

## Configuración del WebServer (opcional pero recomendado)

Si tus tests necesitan una aplicación corriendo (como Angular), puedes configurar Playwright para que inicie el servidor automáticamente.

En `playwright.config.ts`, agrega:

```typescript
export default defineConfig({
  // ... resto de configuración
  
  webServer: {
    command: 'npm start',              // Comando para iniciar el servidor
    url: 'http://localhost:4200',      // URL donde estará disponible
    reuseExistingServer: !process.env.CI,  // Reutiliza si ya está corriendo
    timeout: 120000,                   // Tiempo máximo de espera (2 min)
  },
})
```

### Parámetros:

| Parámetro | Descripción |
|-----------|-------------|
| `command` | Comando que inicia tu aplicación |
| `url` | URL donde Playwright verificará que el servidor esté listo |
| `reuseExistingServer` | Si `true`, no inicia uno nuevo si ya está corriendo |
| `timeout` | Milisegundos máximos para esperar que el servidor inicie |

**Ventaja:** Solo ejecutas `npx playwright test` y Playwright se encarga de iniciar y parar el servidor automáticamente.

---
