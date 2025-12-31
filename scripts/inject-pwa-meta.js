#!/usr/bin/env node
/**
 * Script para inyectar meta tags de PWA en el index.html generado por Expo
 * y actualizar el manifest.json con datos de la API
 * Este script se ejecuta después de la compilación web
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distPath, 'index.html')
const manifestPath = path.join(distPath, 'manifest.json')
const serviceWorkerPath = path.join(distPath, 'service-worker.js')

// Siempre usar .env de la raíz del proyecto
const rootEnvPath = path.join(__dirname, '..', '.env')

/**
 * Lee y parsea el archivo .env de la raíz del proyecto
 * @returns {Object} Variables de entorno
 */
function loadEnvFile() {
  const envVars = {}
  
  if (!fs.existsSync(rootEnvPath)) {
    console.warn('⚠️  .env file not found in project root, using defaults')
    return envVars
  }

  const envContent = fs.readFileSync(rootEnvPath, 'utf8')
  const lines = envContent.split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    // Ignorar comentarios y líneas vacías
    if (!trimmedLine || trimmedLine.startsWith('#')) continue
    
    const equalIndex = trimmedLine.indexOf('=')
    if (equalIndex === -1) continue
    
    const key = trimmedLine.substring(0, equalIndex).trim()
    let value = trimmedLine.substring(equalIndex + 1).trim()
    
    // Remover comillas si existen
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    
    envVars[key] = value
  }
  
  return envVars
}

/**
 * Obtiene la configuración del sistema desde la API
 * @param {string} apiUrl - URL base de la API
 * @returns {Promise<Object|null>} Configuración del sistema o null si falla
 */
async function fetchSystemSettings(apiUrl) {
  if (!apiUrl || apiUrl === 'NOT ASSIGNED') {
    console.warn('⚠️  API_URL not configured')
    return null
  }

  try {
    console.log(`📡 Fetching system settings from: ${apiUrl}/system-settings-active`)
    
    const response = await fetch(`${apiUrl}/system-settings-active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.warn(`⚠️  API returned status ${response.status}`)
      return null
    }

    const data = await response.json()
    
    if (data?.data?.systemSetting) {
      console.log('✅ System settings fetched successfully')
      return data.data.systemSetting
    }
    
    console.warn('⚠️  No system settings found in API response')
    return null
  } catch (error) {
    console.error('❌ Error fetching system settings:', error.message)
    return null
  }
}

/**
 * Actualiza el manifest.json con los datos del sistema
 * @param {Object} systemSettings - Configuración del sistema desde la API
 */
function updateManifest(systemSettings) {
  if (!fs.existsSync(manifestPath)) {
    console.warn('⚠️  manifest.json not found in dist folder')
    return
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    const defaultName = 'GSTI'
    const defaultIcon = '/assets/icon.png'

    // Actualizar nombre
    if (systemSettings?.systemSettingTradeName) {
      manifest.name = `${systemSettings.systemSettingTradeName}`
      manifest.short_name = `${systemSettings.systemSettingTradeName.substring(0, 12)}`
    } else {
      manifest.name = defaultName
      manifest.short_name = 'GSTI'
    }

    // Actualizar iconos si hay favicon disponible
    const iconSrc = systemSettings?.systemSettingFavicon || defaultIcon
    
    manifest.icons = [
      {
        src: iconSrc,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: iconSrc,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: iconSrc,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: iconSrc,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]

    // Agregar theme_color si está disponible
    if (systemSettings?.systemSettingSidebarColor) {
      manifest.theme_color = systemSettings.systemSettingSidebarColor
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
    console.log('✅ manifest.json updated successfully')
    console.log(`   - Name: ${manifest.name}`)
    console.log(`   - Short Name: ${manifest.short_name}`)
    console.log(`   - Icon: ${iconSrc}`)
  } catch (error) {
    console.error('❌ Error updating manifest:', error.message)
  }
}

/**
 * Genera los meta tags de PWA basados en la configuración del sistema
 * @param {Object|null} systemSettings - Configuración del sistema
 * @returns {string} HTML con los meta tags
 */
function generatePWAMetaTags(systemSettings) {
  const appName = systemSettings?.systemSettingTradeName 
    ? `${systemSettings.systemSettingTradeName}` 
    : 'GSTI'
  const themeColor = systemSettings?.systemSettingSidebarColor || '#003366'
  const iconPath = systemSettings?.systemSettingFavicon || '/assets/icon.png'
  // Cache-busting: agregar timestamp para forzar que el navegador descargue el nuevo manifest
  const manifestCacheBuster = Date.now()

  return `
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="${themeColor}">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${appName}">
  <meta name="application-name" content="${appName}">
  <link rel="manifest" href="/manifest.json?v=${manifestCacheBuster}">
  <link rel="apple-touch-icon" href="${iconPath}">
  <link rel="icon" href="${iconPath}">
`
}

// Script para registrar Service Worker
const swScript = `
  <script>
    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            // ServiceWorker registration successful
          })
          .catch(function(error) {
            // ServiceWorker registration failed
          });
      });
    }
  </script>
`

/**
 * Actualiza el título del HTML
 * @param {string} html - Contenido HTML
 * @param {Object|null} systemSettings - Configuración del sistema
 * @returns {string} HTML actualizado
 */
function updateHTMLTitle(html, systemSettings) {
  if (!systemSettings?.systemSettingTradeName) return html
  
  const newTitle = `${systemSettings.systemSettingTradeName}`
  const titleRegex = /<title>[^<]*<\/title>/i
  
  if (titleRegex.test(html)) {
    return html.replace(titleRegex, `<title>${newTitle}</title>`)
  }
  
  return html
}

/**
 * Actualiza o reemplaza el link al manifest con cache-busting
 * @param {string} html - Contenido HTML
 * @returns {string} HTML actualizado
 */
function updateManifestLink(html) {
  const manifestCacheBuster = Date.now()
  const newManifestLink = `<link rel="manifest" href="/manifest.json?v=${manifestCacheBuster}">`
  
  // Reemplazar cualquier link existente al manifest (con o sin query params)
  const manifestLinkRegex = /<link\s+rel=["']manifest["']\s+href=["'][^"']*["']\s*\/?>/gi
  
  if (manifestLinkRegex.test(html)) {
    return html.replace(manifestLinkRegex, newManifestLink)
  }
  
  return html
}

/**
 * Extrae la API_URL compilada en el JavaScript del bundle
 * @returns {string|null} La API_URL encontrada o null
 */
function getCompiledApiUrl() {
  const jsDir = path.join(distPath, '_expo', 'static', 'js', 'web')
  
  if (!fs.existsSync(jsDir)) {
    return null
  }

  try {
    const files = fs.readdirSync(jsDir)
    const indexFile = files.find(f => f.startsWith('index-') && f.endsWith('.js'))
    
    if (!indexFile) {
      return null
    }

    const jsContent = fs.readFileSync(path.join(jsDir, indexFile), 'utf8')
    
    // Buscar el patrón API_URL:"..." en el JavaScript compilado
    const apiUrlMatch = jsContent.match(/API_URL['":\s]+["']([^"']+)["']/)
    
    if (apiUrlMatch && apiUrlMatch[1]) {
      return apiUrlMatch[1]
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * Actualiza el service worker con el timestamp del build
 */
function updateServiceWorkerTimestamp() {
  if (!fs.existsSync(serviceWorkerPath)) {
    console.warn('⚠️  service-worker.js not found in dist folder')
    return
  }

  try {
    let swContent = fs.readFileSync(serviceWorkerPath, 'utf8')
    const buildTimestamp = new Date().toISOString()
    
    // Reemplazar el placeholder del timestamp
    swContent = swContent.replace('__BUILD_TIMESTAMP__', buildTimestamp)
    
    fs.writeFileSync(serviceWorkerPath, swContent)
    console.log(`✅ service-worker.js updated with build timestamp: ${buildTimestamp}`)
  } catch (error) {
    console.error('❌ Error updating service worker:', error.message)
  }
}

/**
 * Función principal que ejecuta el script
 */
async function main() {
  console.log('🚀 Starting PWA meta injection...\n')

  // Cargar variables de entorno desde .env en raíz
  const envVars = loadEnvFile()
  const apiUrl = envVars.API_URL

  if (apiUrl) {
    console.log(`📌 API_URL from .env: ${apiUrl}`)
  }

  // Mostrar la API compilada en el JavaScript
  const compiledApiUrl = getCompiledApiUrl()
  if (compiledApiUrl) {
    console.log(`🔧 API_URL compiled in JS: ${compiledApiUrl}`)
    
    // Advertir si son diferentes
    if (apiUrl && compiledApiUrl !== apiUrl) {
      console.warn(`⚠️  WARNING: .env API differs from compiled API!`)
      console.warn(`   PWA config (manifest/icons) will use .env: ${apiUrl}`)
      console.warn(`   ⚠️  App runtime will still use compiled: ${compiledApiUrl}`)
      console.warn(`   💡 To fix: delete dist/ folder and rebuild`)
    }
  }
  console.log('')

  // Obtener configuración del sistema desde la API
  const systemSettings = await fetchSystemSettings(apiUrl)

  // Actualizar manifest.json
  updateManifest(systemSettings)
  
  // Actualizar service worker con timestamp
  updateServiceWorkerTimestamp()

  // Procesar index.html
  try {
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html not found in dist folder')
      process.exit(1)
    }

    let html = fs.readFileSync(indexPath, 'utf8')

    // Generar meta tags con datos de la API
    const pwaMeta = generatePWAMetaTags(systemSettings)

    // Verificar si ya tiene las meta tags de PWA
    if (!html.includes('apple-mobile-web-app-capable')) {
      // Inyectar meta tags después del <head>
      html = html.replace('<head>', '<head>' + pwaMeta)
    }

    // Verificar si ya tiene el script de SW
    if (!html.includes('serviceWorker.register')) {
      // Inyectar script antes del </body>
      html = html.replace('</body>', swScript + '</body>')
    }

    // Actualizar viewport para deshabilitar zoom
    const viewportRegex = /<meta\s+name="viewport"\s+content="[^"]*"\s*\/?>/i
    const newViewport = '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no" />'
    
    if (viewportRegex.test(html)) {
      html = html.replace(viewportRegex, newViewport)
    }

    // Actualizar título del documento
    html = updateHTMLTitle(html, systemSettings)
    
    // Actualizar link del manifest con cache-busting
    html = updateManifestLink(html)

    fs.writeFileSync(indexPath, html)
    console.log('✅ index.html updated successfully\n')

    console.log('🎉 PWA meta injection completed!')

  } catch (error) {
    console.error('❌ Error injecting PWA meta:', error)
    process.exit(1)
  }
}

// Ejecutar el script
main()
