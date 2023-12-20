const fs = require('fs');
const path = require('path');

/**
 *  Usage: rm -rf index.ts && node get_export_names.js >> index.ts
 */

function toCamelCase(str) {
  return str.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
}

const svgDirPath = path.join(__dirname, '.');

fs.readdirSync(svgDirPath).forEach((file) => {
  if (path.extname(file) === '.svg') {
    const exportName = toCamelCase(file.slice(0, -4));
    console.log(`export { default as ${exportName} } from './${file}';`);
  }
});
