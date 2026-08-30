const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '../app');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles(appDir).filter(f => f.endsWith('page.tsx'));

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Remove the injected wrapper
  if (content.includes('// Suspense-wrapped')) {
    console.log('Cleaning up Suspense-wrapped in:', filePath);
    // Find the Content function name
    const match = content.match(/function\s+([A-Za-z0-9_]+)Content/);
    if (match) {
      const originalName = match[1];
      // Remove everything from the first occurrence of the Content function to the end
      const contentIndex = content.indexOf(`function ${originalName}Content`);
      if (contentIndex !== -1) {
        content = content.substring(0, contentIndex);
        // Restore the original function export
        content = content.replace(`function ${originalName}`, `export default function ${originalName}`);
        changed = true;
      }
    }
  }

  // 2. Fix dynamic import name collision if present
  if (content.includes('nextDynamic')) {
    content = content.split('nextDynamic').join('dynamic');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
});

console.log('Super Cleanup complete.');
