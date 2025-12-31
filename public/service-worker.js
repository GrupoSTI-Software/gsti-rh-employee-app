/**
 * Service Worker para PWA
 * Gestiona el cache y el funcionamiento offline
 * 
 * IMPORTANTE: Cambiar APP_VERSION cada vez que se despliega una nueva versión
 */

// ============================================
// VERSIÓN DE LA APP - CAMBIAR EN CADA DEPLOY
// ============================================
const APP_VERSION = '0.0.7'
const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__' // Se reemplaza en el build

const CACHE_NAME = `gsti-empleado-cache-v${APP_VERSION}`
const DYNAMIC_CACHE_NAME = `gsti-empleado-dynamic-v${APP_VERSION}`

// Archivos estáticos a cachear durante la instalación
// NOTA: manifest.json NO se cachea para permitir actualizaciones dinámicas del nombre/icono
const STATIC_ASSETS = [
  '/',
  '/index.html'
]

// URLs de la API - NO se cachean para permitir datos actualizados desde el servidor
const API_PATTERNS = [
  /\/system-settings-active/,
  /\/api\//,
  /\/auth\//,
  /\/employee/,
  /\/attendance/,
  /\/user/
]

/**
 * Evento de instalación del Service Worker
 * Cachea los archivos estáticos necesarios
 */
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${APP_VERSION}...`)
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(() => {
          // Continuar incluso si algunos assets fallan
          return Promise.resolve()
        })
      })
      .then(() => {
        console.log(`[SW] Version ${APP_VERSION} installed`)
        // Forzar activación inmediata del nuevo SW
        return self.skipWaiting()
      })
  )
})

/**
 * Evento de activación del Service Worker
 * Limpia caches antiguos y notifica a los clientes
 */
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating version ${APP_VERSION}...`)
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Eliminar todos los caches de versiones anteriores (incluyendo caches de API antiguos)
              const isOldCache = name.startsWith('gsti-empleado-') && 
                                 name !== CACHE_NAME && 
                                 name !== DYNAMIC_CACHE_NAME
              if (isOldCache) {
                console.log(`[SW] Deleting old cache: ${name}`)
              }
              return isOldCache
            })
            .map((name) => caches.delete(name))
        )
      })
      .then(() => {
        console.log(`[SW] Version ${APP_VERSION} activated`)
        // Tomar control de todos los clientes inmediatamente
        return self.clients.claim()
      })
      .then(() => {
        // Notificar a todos los clientes que hay una nueva versión
        return self.clients.matchAll({ type: 'window' })
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: APP_VERSION,
            // Indicar que se debe recargar para obtener el nuevo manifest (nombre/icono)
            requiresReload: true,
            message: 'Nueva versión disponible. Por favor recarga la página.'
          })
        })
      })
  )
})

/**
 * Verifica si una URL corresponde a un endpoint de API
 * Las peticiones a la API NO se cachean para siempre obtener datos frescos
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es una petición a la API
 */
function isApiRequest(url) {
  return API_PATTERNS.some(pattern => pattern.test(url))
}

/**
 * Verifica si es un request de navegación (HTML)
 * @param {Request} request - Request a verificar
 * @returns {boolean} True si es un request de navegación
 */
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept')?.includes('text/html'))
}

/**
 * Verifica si es un asset estático
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es un asset estático
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.ico']
  return staticExtensions.some(ext => url.endsWith(ext))
}

/**
 * Verifica si es el manifest.json - NUNCA debe cachearse para permitir actualizaciones dinámicas
 * @param {string} url - URL a verificar
 * @returns {boolean} True si es el manifest
 */
function isManifestRequest(url) {
  return url.includes('manifest.json')
}

/**
 * Estrategia Cache First para assets estáticos
 * @param {Request} request - Request a manejar
 * @returns {Promise<Response>} Respuesta del cache o de la red
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    throw error
  }
}

/**
 * Estrategia Stale While Revalidate para requests generales
 * @param {Request} request - Request a manejar
 * @returns {Promise<Response>} Respuesta del cache mientras se actualiza
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => {
      return cachedResponse
    })
  
  return cachedResponse || fetchPromise
}

/**
 * Evento fetch - Intercepta todas las peticiones
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Ignorar requests que no sean HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return
  }
  
  // Ignorar requests de extensiones del navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return
  }

  // Solo manejar requests GET
  if (request.method !== 'GET') {
    return
  }

  event.respondWith(
    (async () => {
      try {
        // manifest.json - SIEMPRE de la red, nunca cacheado
        // Esto permite que el nombre y icono de la PWA se actualicen correctamente
        if (isManifestRequest(request.url)) {
          try {
            return await fetch(request)
          } catch (error) {
            // Si falla la red, devolver respuesta vacía pero no del cache
            return new Response('{}', {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            })
          }
        }

        // Requests de navegación - Network First con fallback a index.html
        if (isNavigationRequest(request)) {
          try {
            const networkResponse = await fetch(request)
            if (networkResponse.ok) {
              const cache = await caches.open(CACHE_NAME)
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          } catch (error) {
            const cachedResponse = await caches.match(request)
            if (cachedResponse) {
              return cachedResponse
            }
            // Fallback a index.html para SPA
            const indexResponse = await caches.match('/')
            if (indexResponse) {
              return indexResponse
            }
            throw error
          }
        }

        // Requests de API - SIEMPRE de la red, NUNCA del caché
        // Esto garantiza que siempre se obtengan los datos más recientes del servidor
        if (isApiRequest(request.url)) {
          return await fetch(request)
        }

        // Assets estáticos - Cache First
        if (isStaticAsset(request.url)) {
          return await cacheFirst(request)
        }

        // Otros requests - Stale While Revalidate
        return await staleWhileRevalidate(request)
        
      } catch (error) {
        // Intentar devolver algo del cache como último recurso
        const fallbackResponse = await caches.match(request)
        if (fallbackResponse) {
          return fallbackResponse
        }
        
        // Devolver una respuesta de error offline
        return new Response('Offline - Please check your internet connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        })
      }
    })()
  )
})

/**
 * Evento de mensaje - Recibe mensajes desde la aplicación
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting requested')
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...')
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    }).then(() => {
      console.log('[SW] All caches cleared')
      // Notificar que el cache fue limpiado
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'CACHE_CLEARED' })
      }
    })
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        type: 'VERSION_INFO',
        version: APP_VERSION,
        buildTimestamp: BUILD_TIMESTAMP
      })
    }
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    caches.keys().then((cacheNames) => {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          caches: cacheNames,
          version: APP_VERSION
        })
      }
    })
  }
  
  if (event.data && event.data.type === 'CHECK_FOR_UPDATE') {
    // Forzar verificación de actualización
    self.registration.update().then(() => {
      console.log('[SW] Update check completed')
    })
  }
})

/**
 * Evento de sincronización en segundo plano
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    event.waitUntil(
      // Aquí se pueden sincronizar datos de asistencia pendientes
      Promise.resolve()
    )
  }
})

/**
 * Evento de notificación push
 */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'Nueva notificación',
    icon: '/assets/icon.png',
    badge: '/assets/badge.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('SAE Empleados', options)
  )
})

/**
 * Evento de clic en notificación
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/')
      }
    })
  )
})
