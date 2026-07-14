#!/usr/bin/env node

/**
 * @file scripts/verify-setup.js
 * @description Verifica que toda la configuración esté correcta antes de deploy
 * Ejecutar con: node scripts/verify-setup.js
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const checks = [];

function check(name, condition, hint = '') {
  const status = condition ? '✅' : '❌';
  checks.push({ name, status: condition, hint });
  console.log(`${status} ${name}${hint ? ` - ${hint}` : ''}`);
}

console.log('\n🔍 Verificando configuración de INK & IRON Studio...\n');

// 1. Estructura de carpetas
check('Carpeta modulo-react existe', fs.existsSync(path.join(rootDir, 'modulo-react')));
check('Carpeta modulo_vue existe', fs.existsSync(path.join(rootDir, 'modulo_vue')));
check('Carpeta modulo_angular existe', fs.existsSync(path.join(rootDir, 'modulo_angular')));
check('Carpeta lib existe', fs.existsSync(path.join(rootDir, 'lib')));

// 2. Archivos de configuración
check('vite.config.ts existe en raíz', fs.existsSync(path.join(rootDir, 'vite.config.ts')));
check('vite.config.ts en React', fs.existsSync(path.join(rootDir, 'modulo-react/vite.config.ts')));
check('vite.config.ts en Vue', fs.existsSync(path.join(rootDir, 'modulo_vue/vite.config.ts')));

// 3. Índices HTML
check('index.html en raíz', fs.existsSync(path.join(rootDir, 'index.html')));
check('index.html en React', fs.existsSync(path.join(rootDir, 'modulo-react/index.html')));
check('index.html en Vue', fs.existsSync(path.join(rootDir, 'modulo_vue/index.html')));
check('index.html en Angular', fs.existsSync(path.join(rootDir, 'modulo_angular/src/index.html')));

// 4. Servicios de autenticación
check('lib/auth-utils.ts existe', fs.existsSync(path.join(rootDir, 'lib/auth-utils.ts')));
check('React useAuth.ts existe', fs.existsSync(path.join(rootDir, 'modulo-react/src/hooks/useAuth.ts')));
check('Vue useAuth.ts existe', fs.existsSync(path.join(rootDir, 'modulo_vue/src/composables/useAuth.ts')));
check('Angular auth.service.ts existe', fs.existsSync(path.join(rootDir, 'modulo_angular/src/app/services/auth.service.ts')));

// 5. Servicios API
check('React api.ts existe', fs.existsSync(path.join(rootDir, 'modulo-react/src/services/api.ts')));
check('Vue api.ts existe', fs.existsSync(path.join(rootDir, 'modulo_vue/src/services/api.ts')));
check('Angular api.service.ts existe', fs.existsSync(path.join(rootDir, 'modulo_angular/src/app/services/api.service.ts')));

// 6. Supabase
check('lib/supabase.ts existe', fs.existsSync(path.join(rootDir, 'lib/supabase.ts')));

// 7. Documentación
check('README.md existe', fs.existsSync(path.join(rootDir, 'README.md')));
check('DEPLOY.md existe', fs.existsSync(path.join(rootDir, 'DEPLOY.md')));

// 8. Verificar contenido de Vite configs

console.log('\n📋 Verificando configuraciones críticas...\n');

try {
  // React vite.config.ts debe tener base: '/react/'
  const reactConfig = fs.readFileSync(path.join(rootDir, 'modulo-react/vite.config.ts'), 'utf8');
  check('React: base: \'/react/\' configurado', reactConfig.includes("base: '/react/'"));

  // Vue vite.config.ts debe tener base: '/vue/'
  const vueConfig = fs.readFileSync(path.join(rootDir, 'modulo_vue/vite.config.ts'), 'utf8');
  check('Vue: base: \'/vue/\' configurado', vueConfig.includes("base: '/vue/'"));

  // Angular app.config.ts debe tener withHashLocation
  const angularConfig = fs.readFileSync(path.join(rootDir, 'modulo_angular/src/app/app.config.ts'), 'utf8');
  check('Angular: withHashLocation() configurado', angularConfig.includes('withHashLocation()'));

  // React App.tsx debe usar HashRouter
  const reactApp = fs.readFileSync(path.join(rootDir, 'modulo-react/src/App.tsx'), 'utf8');
  check('React: HashRouter configurado', reactApp.includes('HashRouter'));

  // Vue router debe usar createWebHashHistory
  const vueRouter = fs.readFileSync(path.join(rootDir, 'modulo_vue/src/router/index.ts'), 'utf8');
  check('Vue: createWebHashHistory configurado', vueRouter.includes('createWebHashHistory'));

  // Angular index.html debe tener base href /angular/
  const angularHtml = fs.readFileSync(path.join(rootDir, 'modulo_angular/src/index.html'), 'utf8');
  check('Angular: base href /angular/ configurado', angularHtml.includes('base href="/angular/"'));

} catch (err) {
  console.error('⚠️  Error verificando archivos:', err.message);
}

// Resumen
console.log('\n' + '='.repeat(50));
const passed = checks.filter(c => c.status).length;
const total = checks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\n📊 Resultado: ${passed}/${total} verificaciones pasadas (${percentage}%)\n`);

if (percentage === 100) {
  console.log('✨ ¡Configuración lista para desarrollo y deploy!\n');
  process.exit(0);
} else {
  console.log('⚠️  Hay problemas de configuración que necesitan ser resueltos:\n');
  checks.filter(c => !c.status).forEach(c => {
    console.log(`  • ${c.name}${c.hint ? ` - ${c.hint}` : ''}`);
  });
  console.log('');
  process.exit(1);
}
