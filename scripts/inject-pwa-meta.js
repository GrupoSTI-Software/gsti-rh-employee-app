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
            console.log('ServiceWorker registration successful:', registration.scope);
          })
          .catch(function(error) {
            console.log('ServiceWorker registration failed:', error);
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
  if (html.includes('apple-mobile-web-app-capable')) {
    console.log('ℹ️  PWA meta tags already present')
  } else {
    // Inyectar meta tags después del <head>
    html = html.replace('<head>', '<head>' + pwaMeta)
    console.log('✅ PWA meta tags injected')
  }

  // Verificar si ya tiene el script de SW
  if (html.includes('serviceWorker.register')) {
    console.log('ℹ️  Service Worker script already present')
  } else {
    // Inyectar script antes del </body>
    html = html.replace('</body>', swScript + '</body>')
    console.log('✅ Service Worker script injected')
  }

  fs.writeFileSync(indexPath, html)
  console.log('✅ PWA meta tags and scripts successfully injected into index.html')

} catch (error) {
  console.error('❌ Error injecting PWA meta:', error)
  process.exit(1)
}

