/**
 * @file scripts/copy-dist.js
 * @description Script para organizar los builds de todos los módulos en dist/
 * 
 * Estructura final:
 * dist/
 *   ├─ index.html (contenedora)
 *   ├─ assets/
 *   ├─ react/
 *   ├─ vue/
 *   └─ angular/
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const moves = [
  {
    from: path.join(rootDir, 'modulo-react', 'dist'),
    to: path.join(rootDir, 'dist', 'react'),
    name: 'React'
  },
  {
    from: path.join(rootDir, 'modulo_vue', 'dist'),
    to: path.join(rootDir, 'dist', 'vue'),
    name: 'Vue'
  },
  {
    from: path.join(rootDir, 'modulo_angular', 'dist'),
    to: path.join(rootDir, 'dist', 'angular'),
    name: 'Angular'
  }
];

console.log('📦 Organizando distribuciones...\n');

try {
  for (const { from, to, name } of moves) {
    if (fs.existsSync(from)) {
      fs.ensureDirSync(path.dirname(to));
      fs.removeSync(to);
      fs.moveSync(from, to);
      console.log(`✅ ${name} movido a dist/`);
    } else {
      console.warn(`⚠️  ${name} dist no encontrado en ${from}`);
    }
  }

  console.log('\n✨ Estructura dist/ lista para deploy:');
  console.log('   dist/');
  console.log('   ├─ index.html');
  console.log('   ├─ assets/');
  console.log('   ├─ react/');
  console.log('   ├─ vue/');
  console.log('   └─ angular/');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
