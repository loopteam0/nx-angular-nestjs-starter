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

async function main() {
  const allFiles = await listFilesRecursively(targetDir);
  const tsFiles = allFiles.filter((f) => f.endsWith('.ts'));

  let changed = 0;
  for (const filePath of tsFiles) {
    const before = await fs.readFile(filePath, 'utf8');
    const after = ensureExpressRequestImport(before);
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
