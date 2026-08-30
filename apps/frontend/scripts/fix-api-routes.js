const fs = require('fs');
const path = require('path');

/**
 * fix-api-routes.js (Zero-Touch Build Guard)
 * 
 * THIS SCRIPT NO LONGER RENAMES ANY FOLDERS.
 * It only handles the Root Layout for mobile.
 */

const appDir = path.join(process.cwd(), 'app');
const isRevert = process.argv.includes('--revert');

if (isRevert) {
  // Restore API Routes
  const apiDir = path.join(process.cwd(), 'app/api');
  if (fs.existsSync(apiDir)) {
    const restoreRoutes = (dir) => {
      const list = fs.readdirSync(dir);
      list.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          restoreRoutes(filePath);
        } else if (file === 'route.ts') {
          let content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('// @capacitor-build-toggle')) {
            content = content.replace(/\/\/ @capacitor-build-toggle[\s\S]*?\/\/ @capacitor-build-toggle\r?\n(\r?\n)?/, '');
            fs.writeFileSync(filePath, content);
            console.log(`[EzeeFlights] Restored API route: ${path.relative(process.cwd(), filePath)}`);
          }
        }
      });
    };
    restoreRoutes(apiDir);
  }
  console.log('[EzeeFlights] Zero-Touch Revert: Restoration complete.');
  process.exit(0);
}

console.log('[EzeeFlights] Zero-Touch Preparation...');

// Create a layout.mobile.tsx based on the original layout.tsx
// but with static-export safety applied.
const sourceLayout = path.join(appDir, 'layout.tsx');
const destLayout = path.join(appDir, 'layout.mobile.tsx');

if (fs.existsSync(sourceLayout)) {
  let content = fs.readFileSync(sourceLayout, 'utf8');

  // Patch for static export safety (no dynamic headers()/cookies() in static export)
  content = content.replace(
    /const\s+headersList\s*=\s*await\s+headers\(\);\s*\r?\n\s*const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*\r?\n\s*const\s+sessionId\s*=\s*[\s\S]*?generateCorrelationId\(\);/,
    'const headersList = null;\n  const sessionId = "mobile-build";',
  );
  content = content.replace(
    /import \{ cookies, headers \} from "next\/headers";\r?\n/,
    '',
  );

  // Add force-static
  content = 'export const dynamic = "force-static";\n' + content;

  fs.writeFileSync(destLayout, content);
  console.log('[EzeeFlights] Created layout.mobile.tsx (Original layout.tsx is UNTOUCHED)');
}

// 2. Handle API Proxy Routes
const apiDir = path.join(process.cwd(), 'app/api');
if (fs.existsSync(apiDir)) {
  const findRoutes = (dir) => {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        findRoutes(filePath);
      } else if (file === 'route.ts') {
        let content = fs.readFileSync(filePath, 'utf8');
        if (!content.includes('export const dynamic = "force-static"')) {
          console.log(`[EzeeFlights] Protecting API route: ${path.relative(process.cwd(), filePath)}`);
          content = '// @capacitor-build-toggle\nexport const dynamic = "force-static";\nexport function generateStaticParams() { return []; }\n// @capacitor-build-toggle\n\n' + content;
          fs.writeFileSync(filePath, content);
        }
      }
    });
  };
  findRoutes(apiDir);
}
