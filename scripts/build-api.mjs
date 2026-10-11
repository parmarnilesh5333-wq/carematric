import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const tsApiFile = path.resolve(process.cwd(), 'api', 'index.ts');
if (fs.existsSync(tsApiFile)) {
  fs.unlinkSync(tsApiFile);
}

await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'api/index.js',
  external: [
    'express',
    'cors',
    'dotenv',
    'multer',
    'pdf-parse',
    'pdf-parse/*',
    'pdfkit',
    'tesseract.js',
  ],
  banner: {
    js: '// Pre-bundled CareMatric AI Serverless API entry point for Vercel',
  },
});

console.log('[build-api] Bundled server/index.ts -> api/index.js successfully.');
