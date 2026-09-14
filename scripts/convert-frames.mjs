import sharp from "sharp";
import { readdir, mkdir } from "fs/promises";
import { join } from "path";

const src = "./animation_scrol";
const dst = "./public/frames";
await mkdir(dst, { recursive: true });

const files = (await readdir(src)).filter((f) => f.endsWith(".png")).sort();

for (const file of files) {
  // 0060-stop.png → frame_0060-stop.webp
  // 0001.png      → frame_0001.webp
  const base = file.replace(".png", "");
  const padded = base.replace(/^(\d+)/, (n) => n.padStart(4, "0"));
  const out = `frame_${padded}.webp`;

  await sharp(join(src, file)).webp({ quality: 82 }).toFile(join(dst, out));

  console.log(`✓ ${file} → ${out}`);
}
console.log("Done.");
