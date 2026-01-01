# Device Fingerprint - Documentación Técnica

## Descripción General

El **Device Fingerprint** es un identificador único generado a partir de las características del hardware y software del dispositivo del usuario, **combinado con un UUID único por instancia** (`instanceId`). 

Esta combinación garantiza que:
- **Dos dispositivos iguales** (mismo modelo, misma configuración) tengan **fingerprints diferentes**
- El identificador sea **único por dispositivo/navegador**
- Se pueda **diferenciar** correctamente entre dispositivos iOS y macOS

## Ubicación del Código

```
src/shared/infrastructure/services/device-service.ts
```

---

## Arquitectura del Servicio

### Interfaces

#### `IDeviceInfo` - Información Básica
```typescript
interface IDeviceInfo {
  deviceModel: string | null    // Modelo del dispositivo/navegador
  deviceBrand: string | null    // Marca/fabricante
  deviceType: string | null     // Tipo (Desktop, Mobile, Tablet)
  deviceOs: string | null       // Sistema operativo
}
```

#### `IDeviceInfoExtended` - Información Extendida
```typescript
interface IDeviceInfoExtended extends IDeviceInfo {
  screenResolution: string | null      // Resolución de pantalla
  language: string | null              // Idioma principal
  cpuCores: number | null              // Núcleos de CPU
  deviceMemory: number | null          // Memoria RAM en GB
  isOnline: boolean                    // Estado de conexión
  connectionType: string | null        // Tipo de conexión (4g, wifi)
  isTouchScreen: boolean               // Soporte táctil
  pixelRatio: number | null            // Densidad de píxeles
  isPWA: boolean                       // Si es PWA instalada
  userAgent: string | null             // User Agent completo
  platform: string                     // Plataforma (web, ios, android)
  deviceFingerprint: string | null     // Fingerprint único (hash de todos los componentes)
  instanceId: string | null            // ⭐ UUID único por instancia (diferencia dispositivos iguales)
  timezone: string | null              // Zona horaria
  timezoneOffset: number | null        // Offset UTC en minutos
  languages: string[] | null           // Idiomas preferidos
  gpuRenderer: string | null           // GPU - Renderizador
  gpuVendor: string | null             // GPU - Fabricante
  colorDepth: number | null            // Profundidad de color
}
```

---

## Proceso de Generación del Fingerprint

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    DeviceService                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │ getDeviceInfo() │ ◄── Información básica                 │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────┐                                │
│  │ getDeviceInfoExtended() │ ◄── Información completa       │
│  └────────┬────────────────┘                                │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────────┐                            │
│  │ generateDeviceFingerprint() │                            │
│  └────────┬────────────────────┘                            │
│           │                                                  │
│           ├──► Recopilar características                    │
│           ├──► Obtener WebGL info (GPU)                     │
│           ├──► Generar Canvas fingerprint                   │
│           ├──► Combinar en string                           │
│           └──► Aplicar hash (djb2)                          │
│                    │                                         │
│                    ▼                                         │
│           ┌───────────────┐                                  │
│           │  "a3f2b8c1"   │ ◄── Fingerprint final (8 chars) │
│           └───────────────┘                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Componentes del Fingerprint

El fingerprint se genera combinando las siguientes características:

| # | Componente | Descripción | Ejemplo |
|---|------------|-------------|---------|
| **1** | **Instance ID** ⭐ | **UUID único por instancia (clave para diferenciar dispositivos iguales)** | `a1b2c3d4-e5f6-...` |
| 2 | User Agent | Cadena completa del navegador | `Mozilla/5.0 (Macintosh...)` |
| 3 | Idiomas | Lista de idiomas preferidos | `es-MX,es,en` |
| 4 | Resolución | Tamaño de pantalla | `1920x1080` |
| 5 | Color Depth | Profundidad de color | `24` |
| 6 | Available Screen | Área disponible | `1920x1055` |
| 7 | Timezone | Zona horaria | `America/Mexico_City` |
| 8 | Timezone Offset | Offset UTC | `-360` |
| 9 | CPU Cores | Núcleos de procesador | `8` |
| 10 | Device Memory | RAM en GB | `16` |
| 11 | Touch Points | Puntos táctiles máximos | `0` o `5` |
| 12 | Platform | Plataforma del navegador | `MacIntel` |
| 13 | Pixel Ratio | Densidad de píxeles | `2` |
| 14 | GPU Vendor | Fabricante de GPU | `Apple Inc.` |
| 15 | GPU Renderer | Modelo de GPU | `Apple M1 Pro` |
| 16 | Canvas Fingerprint | Hash de renderizado | `data:image/png...` |

### Instance ID - Diferenciador de Dispositivos Iguales

El `instanceId` es un **UUID único** que se genera una sola vez y se almacena en `localStorage`. Es el componente **más importante** porque:

```
Dispositivo A (iPhone 15)     Dispositivo B (iPhone 15)
├── instanceId: "abc-123"     ├── instanceId: "xyz-789"  ← DIFERENTE
├── userAgent: igual          ├── userAgent: igual
├── screen: igual             ├── screen: igual
└── etc: igual                └── etc: igual

Fingerprint A: "f8a2b1c3"     Fingerprint B: "d4e5f6a7"  ← DIFERENTES
```

**Nota**: Si el usuario borra localStorage, se genera un nuevo `instanceId`, lo cual es deseable para seguridad.

---

## Detección de iOS vs macOS

### Problema

Safari en iOS 13+ puede mostrar un User Agent idéntico al de macOS cuando el usuario tiene activado "Solicitar sitio de escritorio". Esto causaba que los iPhones/iPads se detectaran como macOS.

### Solución

Se implementó el método `isIOS()` que detecta correctamente dispositivos iOS:

```typescript
private static isIOS(): boolean {
  // Detección directa por UA
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return true
  }
  
  // Detección para iPad con UA de escritorio (iPadOS 13+)
  // iPad con Safari muestra UA de Mac, pero tiene touchscreen
  if (userAgent.includes('Mac OS X')) {
    const hasTouch = navigator.maxTouchPoints > 0  // iPad tiene touch
    const isMacPlatform = navigator.platform === 'MacIntel'
    
    // Mac real NO tiene touch, iPad SÍ
    if (hasTouch && isMacPlatform) {
      return true  // Es iPad disfrazado de Mac
    }
  }
  
  return false
}
```

### Lógica de Detección

| Característica | Mac Real | iPad (UA escritorio) | iPhone |
|---------------|----------|---------------------|--------|
| User Agent | `Mac OS X` | `Mac OS X` | `iPhone` |
| platform | `MacIntel` | `MacIntel` | `iPhone` |
| maxTouchPoints | `0` | `5` | `5` |
| **Resultado** | **macOS** | **iOS** ✅ | **iOS** ✅ |

---

## Métodos de Obtención de Datos

### 1. WebGL Info (GPU)

```typescript
private static getWebGLInfo(): { vendor: string | null; renderer: string | null }
```

Obtiene información de la GPU utilizando la extensión `WEBGL_debug_renderer_info`:

```typescript
const canvas = document.createElement('canvas')
const gl = canvas.getContext('webgl')
const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')

// Obtener datos
vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)   // "Apple Inc."
renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) // "Apple M1 Pro"
```

### 2. Canvas Fingerprint

```typescript
private static getCanvasFingerprint(): string | null
```

Cada dispositivo/navegador renderiza gráficos de manera ligeramente diferente debido a:
- Diferencias en la GPU
- Controladores gráficos
- Configuración de antialiasing
- Fuentes del sistema

```typescript
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

// Renderizar elementos con diferentes estilos
ctx.textBaseline = 'top'
ctx.font = '14px Arial'
ctx.fillStyle = '#f60'
ctx.fillRect(125, 1, 62, 20)
ctx.fillStyle = '#069'
ctx.fillText('Device Fingerprint', 2, 15)
ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
ctx.fillText('Device Fingerprint', 4, 17)

// Exportar como data URL
return canvas.toDataURL().slice(-50)
```

### 3. Algoritmo de Hash (djb2)

```typescript
private static hashString(str: string): string
```

Se utiliza el algoritmo **djb2** para generar un hash compacto:

```typescript
let hash = 5381
for (let i = 0; i < str.length; i++) {
  hash = ((hash << 5) + hash) + str.charCodeAt(i)
  hash = hash & hash // Convertir a 32-bit integer
}
return (hash >>> 0).toString(16).padStart(8, '0')
```

**Características del djb2:**
- Rápido y eficiente
- Baja colisión para strings similares
- Genera hash de 8 caracteres hexadecimales
- Determinístico (mismo input = mismo output)

---

## Uso en la Aplicación

### Token Manager

El `deviceToken` ahora utiliza el fingerprint como identificador principal:

```javascript
// presentation/utils/token-manager.js

export async function getOrCreateDeviceToken() {
  // Prioridad 1: Usar fingerprint (más persistente)
  const deviceInfo = DeviceService.getDeviceInfoExtended()
  
  if (deviceInfo.deviceFingerprint) {
    return deviceInfo.deviceFingerprint
  }

  // Fallback: UUID almacenado localmente
  let token = await SecureStore.getItemAsync(TOKEN_KEY)
  // ...
}
```

### Login Request

Los datos se envían al servidor durante el login:

```typescript
// Repositorios de login
const response = await httpService.post('/auth/login', {
  userEmail: email,
  userPassword: password,
  deviceToken: deviceInfo.deviceFingerprint,
  deviceFingerprint: deviceInfo.deviceFingerprint,
  deviceModel: deviceInfo.deviceModel,
  deviceBrand: deviceInfo.deviceBrand,
  // ... más campos
})
```

---

## Datos Enviados al Servidor

### Ejemplo de Payload Web (Desktop)

```json
{
  "userEmail": "usuario@empresa.com",
  "userPassword": "***",
  "deviceToken": "a3f2b8c1",
  "deviceFingerprint": "a3f2b8c1",
  "instanceId": "550e8400-e29b-41d4-a716-446655440000",
  "deviceModel": "Google Chrome 120.0.6099.234",
  "deviceBrand": "Google",
  "deviceType": "Desktop",
  "deviceOs": "macOS 15.1.0",
  "screenResolution": "1920x1080",
  "language": "es-MX",
  "cpuCores": 8,
  "deviceMemory": 16,
  "connectionType": "4g",
  "isTouchScreen": false,
  "isPWA": true,
  "platform": "web",
  "timezone": "America/Mexico_City",
  "timezoneOffset": -360,
  "languages": ["es-MX", "es", "en"],
  "gpuVendor": "Apple Inc.",
  "gpuRenderer": "Apple M1 Pro",
  "colorDepth": 24
}
```

### Ejemplo de Payload Web (iPhone con Safari)

```json
{
  "userEmail": "usuario@empresa.com",
  "userPassword": "***",
  "deviceToken": "b7c8d9e0",
  "deviceFingerprint": "b7c8d9e0",
  "instanceId": "660f9511-f3ac-52e5-b827-557766551111",
  "deviceModel": "Safari 17.2",
  "deviceBrand": "Apple",
  "deviceType": "iPhone",
  "deviceOs": "iOS 17.2",
  "screenResolution": "390x844",
  "language": "es-MX",
  "cpuCores": null,
  "deviceMemory": null,
  "connectionType": "4g",
  "isTouchScreen": true,
  "isPWA": false,
  "platform": "web",
  "timezone": "America/Mexico_City",
  "timezoneOffset": -360,
  "languages": ["es-MX", "es"],
  "gpuVendor": "Apple Inc.",
  "gpuRenderer": "Apple GPU",
  "colorDepth": 32
}
```

### Ejemplo de Payload Móvil (Expo Android)

```json
{
  "userEmail": "usuario@empresa.com",
  "userPassword": "***",
  "deviceToken": "RKQ1.211119.001",
  "deviceFingerprint": "RKQ1.211119.001",
  "instanceId": "RKQ1.211119.001",
  "deviceModel": "Pixel 6",
  "deviceBrand": "Google",
  "deviceType": "Pixel 6",
  "deviceOs": "Android 13",
  "screenResolution": null,
  "language": null,
  "cpuCores": 2,
  "deviceMemory": 8,
  "connectionType": null,
  "isTouchScreen": true,
  "isPWA": false,
  "platform": "android",
  "timezone": "America/Mexico_City",
  "timezoneOffset": -360,
  "languages": null,
  "gpuVendor": null,
  "gpuRenderer": null,
  "colorDepth": null
}
```

---

## Comparativa: Web vs Nativo

| Característica | Web | iOS/Android |
|----------------|-----|-------------|
| deviceFingerprint | Hash de características | `Device.osBuildId` o `Device.modelId` |
| screenResolution | ✅ Disponible | ❌ Requiere Dimensions |
| language | ✅ `navigator.language` | ❌ Requiere expo-localization |
| cpuCores | ✅ `hardwareConcurrency` | ✅ `supportedCpuArchitectures.length` |
| deviceMemory | ✅ `navigator.deviceMemory` | ✅ `Device.totalMemory` |
| gpuVendor/Renderer | ✅ WebGL | ❌ No disponible |
| connectionType | ✅ Network Information API | ❌ Requiere NetInfo |
| isPWA | ✅ Detectable | ❌ Siempre false |
| canvas fingerprint | ✅ Disponible | ❌ No aplicable |

---

## Consideraciones de Privacidad

### ⚠️ Importante

El fingerprinting es una técnica que puede identificar usuarios sin su consentimiento explícito. Se recomienda:

1. **Informar al usuario** sobre la recopilación de datos del dispositivo
2. **Incluir en políticas de privacidad** el uso de fingerprinting
3. **Usar solo para fines legítimos** como seguridad y prevención de fraude
4. **Cumplir con GDPR/LGPD** si aplica en la jurisdicción

### Persistencia del Fingerprint

| Acción del Usuario | instanceId | Fingerprint | Comportamiento |
|--------------------|------------|-------------|----------------|
| Borrar cookies | ✅ Persiste | ✅ Persiste | Sin cambio |
| Borrar localStorage | ❌ Se regenera | ❌ Cambia | **Nuevo identificador** |
| Modo incógnito | ❌ Temporal | ❌ Diferente | Fingerprint diferente por sesión |
| Actualizar navegador | ✅ Persiste | ⚠️ Puede cambiar | Depende de cambios en UA |
| Cambiar resolución | ✅ Persiste | ⚠️ Puede cambiar | Componente de resolución cambia |
| Otro dispositivo igual | ❌ Diferente | ❌ Diferente | **Cada dispositivo es único** ✅ |

### Flujo de Identificación

```
┌─────────────────────────────────────────────────────────────────┐
│                    Primer acceso al sitio                        │
├─────────────────────────────────────────────────────────────────┤
│  1. ¿Existe instanceId en localStorage?                          │
│     └── NO → Generar UUID → Guardar en localStorage             │
│     └── SÍ → Usar existente                                      │
│                                                                   │
│  2. Recopilar características del dispositivo                    │
│     └── instanceId + UA + screen + timezone + GPU + canvas...   │
│                                                                   │
│  3. Generar hash (djb2) de todos los componentes                │
│     └── Resultado: deviceFingerprint                             │
│                                                                   │
│  4. Enviar al servidor:                                          │
│     └── deviceToken = deviceFingerprint                          │
│     └── instanceId (para trazabilidad adicional)                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Limitaciones

1. **No es 100% único**: Dispositivos con configuraciones idénticas pueden generar el mismo fingerprint
2. **Puede cambiar**: Actualizaciones de SO, drivers o navegador pueden modificar el fingerprint
3. **Navegadores anti-fingerprint**: Brave, Firefox con protección activada pueden bloquear algunas técnicas
4. **WebGL puede no estar disponible**: Algunos navegadores o configuraciones deshabilitan WebGL

---

## Referencias

- [MDN - Navigator API](https://developer.mozilla.org/en-US/docs/Web/API/Navigator)
- [MDN - WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [Canvas Fingerprinting](https://browserleaks.com/canvas)
- [Expo Device](https://docs.expo.dev/versions/latest/sdk/device/)
- [djb2 Hash Algorithm](http://www.cse.yorku.ca/~oz/hash.html)

