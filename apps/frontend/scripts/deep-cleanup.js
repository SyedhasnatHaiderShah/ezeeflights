const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../app');

function cleanup(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file.includes('_dynamic_hidden_')) {
        let cleanName = file;
        while (cleanName.includes('_dynamic_hidden_')) {
          cleanName = cleanName.replace('_dynamic_hidden_', '');
        }
        const newPath = path.join(dir, cleanName);
        fs.renameSync(filePath, newPath);
        console.log(`[Cleanup] Restored: ${cleanName}`);
        cleanup(newPath);
      } else {
        cleanup(filePath);
      }
    }
  });
}

console.log('Starting deep cleanup...');
cleanup(appDir);
console.log('Cleanup complete.');
