/**
 * Service Worker para PWA
 * Gestiona el cache y el funcionamiento offline
 */

const CACHE_NAME = 'sae-empleados-v1'
const DYNAMIC_CACHE_NAME = 'sae-empleados-dynamic-v1'
const API_CACHE_NAME = 'sae-empleados-api-v1'

// Archivos estáticos a cachear durante la instalación
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
]

// URLs de la API que deben cachearse
const API_CACHE_PATTERNS = [
  /\/system-settings-active/
]

/**
 * Evento de instalación del Service Worker
 * Cachea los archivos estáticos necesarios
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets')
        return cache.addAll(STATIC_ASSETS).catch((error) => {
          console.log('[SW] Some static assets failed to cache:', error)
          // Continuar incluso si algunos assets fallan
          return Promise.resolve()
        })
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
  )
})

/**
 * Evento de activación del Service Worker
 * Limpia caches antiguos
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== CACHE_NAME && 
                     name !== DYNAMIC_CACHE_NAME && 
                     name !== API_CACHE_NAME
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete')
        return self.clients.claim()
      })
  )
})

/**
 * Verifica si una URL corresponde a un endpoint de API cacheable
 * @param {string} url - URL a verificar
 * @returns {boolean} True si la URL debe cachearse
 */
function isApiRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url))
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
    console.log('[SW] Cache First failed:', error)
    throw error
  }
}

/**
 * Estrategia Network First para requests de API
 * @param {Request} request - Request a manejar
 * @returns {Promise<Response>} Respuesta de la red o del cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, falling back to cache:', error)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
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
    .catch((error) => {
      console.log('[SW] Network request failed:', error)
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

        // Requests de API - Network First
        if (isApiRequest(request.url)) {
          return await networkFirst(request)
        }

        // Assets estáticos - Cache First
        if (isStaticAsset(request.url)) {
          return await cacheFirst(request)
        }

        // Otros requests - Stale While Revalidate
        return await staleWhileRevalidate(request)
        
      } catch (error) {
        console.log('[SW] Fetch handler error:', error)
        
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
    console.log('[SW] Clearing all caches')
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      )
    })
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    caches.keys().then((cacheNames) => {
      event.ports[0].postMessage({
        type: 'CACHE_STATUS',
        caches: cacheNames
      })
    })
  }
})

/**
 * Evento de sincronización en segundo plano
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag)
  
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
  console.log('[SW] Push notification received')
  
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
  console.log('[SW] Notification click received')
  
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

console.log('[SW] Service Worker loaded')

