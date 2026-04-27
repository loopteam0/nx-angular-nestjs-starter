import fs from 'node:fs/promises';
import path from 'node:path';

const targetDir = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve('apps/api/src/generated/openapi-server');

async function listFilesRecursively(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursively(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function removeEnumLiteralsFromImports(sourceText) {
  // First decode HTML entities
  const decoded = sourceText
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

  // Match import statements and remove inline enum literals ('value1' | 'value2' | ...)
  return decoded.replace(
    /import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"])/g,
    (match, importsSection, fromClause) => {
      // Split by comma and filter out string literals
      const items = importsSection
        .split(',')
        .map(item => item.trim())
        .filter(item => {
          // Keep if it's not a quoted string literal
          return !(item.startsWith("'") && item.endsWith("'")) &&
            !(item.startsWith('"') && item.endsWith('"'));
        })
        .filter(item => item.length > 0 && item !== '|');

      const cleaned = items.join(', ').trim();

      if (!cleaned) {
        // If nothing left, remove the entire import
        return '';
      }

      return `import { ${cleaned} } from ${fromClause}`;
    }
  ).replace(/\n\n+/g, '\n'); // Clean up extra blank lines
}

function ensureExpressRequestImport(sourceText) {
  const needsRequest = /\bRequest\b/.test(sourceText) && /\brequest\s*:\s*Request\b|@Req\(\)\s*request\s*:\s*Request\b/.test(sourceText);
  if (!needsRequest) return sourceText;

  const hasExpressImport = /from ['\"]express['\"]/m.test(sourceText);
  if (hasExpressImport) return sourceText;

  const importLine = "import type { Request } from 'express';\n";

  // Insert after the last existing import, otherwise at top.
  const importMatches = [...sourceText.matchAll(/^import .*;\s*$/gm)];
  if (importMatches.length === 0) {
    return importLine + sourceText;
  }

  const lastImport = importMatches[importMatches.length - 1];
  const insertAt = lastImport.index + lastImport[0].length;
  return sourceText.slice(0, insertAt) + "\n" + importLine + sourceText.slice(insertAt);
}

function fixStatusCodeHyphens(sourceText) {
  // Fix import paths like './get-foo200-response-bar' → './get-foo-200-response-bar'
  // The OpenAPI generator omits the hyphen before 3-digit HTTP status codes in import paths
  return sourceText.replace(
    /(from\s+['"][^'"]*?)([a-z])(\d{3})-/g,
    '$1$2-$3-'
  );
}

async function main() {
  const allFiles = await listFilesRecursively(targetDir);
  const tsFiles = allFiles.filter((f) => f.endsWith('.ts'));

  let changed = 0;
  for (const filePath of tsFiles) {
    const before = await fs.readFile(filePath, 'utf8');
    let after = removeEnumLiteralsFromImports(before);
    after = ensureExpressRequestImport(after);
    after = fixStatusCodeHyphens(after);
    if (after !== before) {
      await fs.writeFile(filePath, after, 'utf8');
      changed++;
    }
  }


  console.log(`[openapi] Patched ${changed} file(s) in ${targetDir}`);
}

main().catch((err) => {

  console.error('[openapi] Patch failed:', err);
  process.exitCode = 1;
});
