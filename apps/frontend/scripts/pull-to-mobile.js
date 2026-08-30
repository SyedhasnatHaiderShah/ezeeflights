/**
 * pull-to-mobile.js
 * 
 * A utility to manually "pull" a page from the main Next.js app into the 
 * mobile-optimized (mobile) directory. 
 * 
 * Usage: node scripts/pull-to-mobile.js /flights
 */

const fs = require('fs');
const path = require('path');

const route = process.argv[2];

if (!route) {
  console.error('Error: Please provide a route (e.g., /flights)');
  process.exit(1);
}

// Normalize route
const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
const sourceDir = path.join(process.cwd(), 'app', cleanRoute);
const sourceFile = path.join(sourceDir, 'page.tsx');

if (!fs.existsSync(sourceFile)) {
  console.error(`Error: Source page not found at ${sourceFile}`);
  process.exit(1);
}

// Determine mobile destination
let destFile;
if (cleanRoute === '') {
  destFile = path.join(process.cwd(), 'app', 'page.mobile.tsx');
} else {
  const destDir = path.join(process.cwd(), 'app', cleanRoute);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  destFile = path.join(destDir, 'page.mobile.tsx');
}

let content = fs.readFileSync(sourceFile, 'utf8');

console.log(`[PullToMobile] Copying ${route} -> ${path.relative(process.cwd(), destFile)}`);

// --- Apply Mobile-Specific Transformations ---

// 1. Force Client Side (MUST BE FIRST LINE)
if (content.includes('"use client"') || content.includes("'use client'")) {
  content = content.replace(/['"]use client['"];?\n?/, '');
}
content = '"use client";\n' + content;

// 2. Add Mobile Branding/Header if needed (Optional)
// You can add mobile-specific components here

// 3. Ensure Suspense wrapping for useSearchParams
if (content.includes('useSearchParams') && !content.includes('Suspense-wrapped')) {
  console.log(`[PullToMobile] Wrapping in Suspense for static-export safety`);

  // Ensure Suspense is imported
  if (!content.includes('import { Suspense') && !content.includes('import {Suspense')) {
    content = content.replace(/['"]use client['"];?\n?/, (match) => match + "import { Suspense } from 'react';\n");
  }

  // Wrap the default export
  const exportMatch = content.match(/export\s+default\s+function\s+([A-Za-z0-9_]+)/);
  if (exportMatch) {
    const componentName = exportMatch[1];
    content = content.replace(exportMatch[0], `function ${componentName}Content`);
    content += `\n// Suspense-wrapped\nexport default function ${componentName}(props: any) {\n  return <Suspense fallback={null}><${componentName}Content {...props} /></Suspense>;\n}\n`;
  }
}

// 4. Handle name collisions with Next.js dynamic
if (content.includes('import dynamic')) {
  content = content.split('import dynamic').join('import nextDynamic');
  content = content.split('dynamic(').join('nextDynamic(');
}

// 5. Fix relative imports (../../ -> @/)
content = content.replace(/from\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, 'from "@/$1"');
content = content.replace(/import\s+['"]\.\.\/\.\.\/([^'"]+)['"]/g, 'import "@/$1"');

// Fix deeper relative imports if any (../../../ -> @/)
content = content.replace(/from\s+['"]\.\.\/\.\.\/\.\.\/([^'"]+)['"]/g, 'from "@/$1"');
content = content.replace(/import\s+['"]\.\.\/\.\.\/\.\.\/([^'"]+)['"]/g, 'import "@/$1"');

// Fix local relative imports (./ -> @/app/currentRoute/)
const currentDir = `@/app/${cleanRoute}`;
content = content.replace(/from\s+['"]\.\/([^'"]+)['"]/g, `from "${currentDir}/$1"`);

// 6. Strip Node.js only imports that break on the client
content = content.replace(/import fs from ['"]fs['"];?\n?/g, '');
content = content.replace(/import path from ['"]path['"];?\n?/g, '');

// 7. Strip Next.js route configurations that fail in client components
content = content.replace(/export\s+const\s+revalidate\s+=\s+\d+;?\n?/g, '');
content = content.replace(/export\s+const\s+dynamic\s+=\s+['"][^'"]+['"];?\n?/g, '');

// Stub out fs-dependent functions
if (content.includes('function resolveAirportCode')) {
  content = content.replace(
    /function resolveAirportCode[\s\S]*?return upper;\n}/,
    'function resolveAirportCode(query: string): string { return query ? query.toUpperCase().trim() : ""; }'
  );
}

fs.writeFileSync(destFile, content);
console.log(`[PullToMobile] SUCCESS: Page created at ${path.relative(process.cwd(), destFile)}`);
console.log(`[PullToMobile] You can now manually edit this file to optimize it for mobile!`);
