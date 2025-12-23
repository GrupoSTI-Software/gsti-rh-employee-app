#!/usr/bin/env node
/**
 * Script para inyectar meta tags de PWA en el index.html generado por Expo
 * Este script se ejecuta después de la compilación web
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const distPath = path.join(__dirname, '..', 'dist')
const indexPath = path.join(distPath, 'index.html')

// Meta tags de PWA a inyectar
const pwaMeta = `
  <!-- PWA Meta Tags -->
  <meta name="theme-color" content="#003366">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="SAE Empleados">
  <meta name="application-name" content="SAE Empleados">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/assets/icon.png">
`

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

try {
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found in dist folder')
    process.exit(1)
  }

  let html = fs.readFileSync(indexPath, 'utf8')

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

  fs.writeFileSync(indexPath, html)

} catch (error) {
  console.error('❌ Error injecting PWA meta:', error)
  process.exit(1)
}

