const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '../src/modules/notification/templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.template.ts'));

for (const file of files) {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already wrapped
  if (content.includes('wrapEmailLayout')) {
    continue;
  }

  // Add import
  content = "import { wrapEmailLayout } from './layout';\n" + content;

  // Replace html: '...' with html: wrapEmailLayout(`...`)
  content = content.replace(/html:\s*'([^']*)'/, (match, htmlContent) => {
    // Basic formatting for the html content inside
    let formattedHtml = htmlContent;

    // We can try to make it look a bit better by replacing some common patterns
    // But wrapping it is the main goal
    formattedHtml = formattedHtml.replace(/<p>Hi {{userName}},<\/p>/g, '<h2>Hi {{userName}},</h2>');
    formattedHtml = formattedHtml.replace(/<p>Hi {{email}},<\/p>/g, '<h2>Hi {{email}},</h2>');

    // Make strong tags into info boxes if they look like ref or total
    if (formattedHtml.includes('Total') || formattedHtml.includes('Total paid') || formattedHtml.includes('Ref') || formattedHtml.includes('ref')) {
      // Very basic transformation for typical booking string
      // Just applying a general wrapping to the p tags isn't robust, but adding wrapEmailLayout is generic
    }

    return `html: wrapEmailLayout(\`\n    ${formattedHtml}\n  \`)`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
