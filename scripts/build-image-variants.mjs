import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const publicDir = join(process.cwd(), 'public');
const outputDir = join(publicDir, 'image-variants');
const sizes = [48, 96, 192, 384, 768, 1280, 1920];
const manifest = {};
let sourceBytes = 0, variantBytes = 0;
async function scan(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (path === outputDir) continue;
    if (entry.isDirectory()) files.push(...await scan(path));
    else if (/^\.(png|jpe?g|webp|avif)$/i.test(extname(path))) files.push(path);
  }
  return files;
}
const files = await scan(publicDir);
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
for (const path of files) {
  const input = await readFile(path);
  const metadata = await sharp(input).metadata();
  if (!metadata.width || (metadata.pages || 1) > 1) continue;
  const source = '/' + relative(publicDir, path).split('\\').join('/');
  const hash = createHash('sha256').update(source).update(input).digest('hex').slice(0, 20);
  const widths = [...new Set(sizes.map(size => Math.min(size, metadata.width)))];
  manifest[source] = [];
  sourceBytes += input.length;
  for (const width of widths) {
    const file = `${hash}-${width}.webp`;
    const result = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    await writeFile(join(outputDir, file), result);
    variantBytes += result.length;
    manifest[source].push({ width, src: '/image-variants/' + file });
  }
}
await writeFile(join(process.cwd(), 'lib/image-variants.json'), JSON.stringify(manifest));
console.log(JSON.stringify({ images: Object.keys(manifest).length, sourceBytes, variantBytes }));
