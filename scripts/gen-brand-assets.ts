import { Renderer } from "@takumi-rs/core";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";
import { MARK_PATHS, markSvg } from "../src/lib/brand-mark";

const EMERALD = "#047857";
const EMERALD_LIGHT = "#34d399";
const META = "static/assets/meta";

const paths = (paint: string) => MARK_PATHS.map((d) => `<path d="${d}" ${paint}/>`).join("");

/** App icon: emerald tile with the white mark. `bleed` fills the square for maskable and iOS icons. */
function tileSvg(bleed: boolean): string {
  const radius = bleed ? 0 : 108;
  const inset = bleed ? 0 : 16;
  const markSize = bleed ? 300 : 316;
  const offset = (512 - markSize) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#059669"/>
      <stop offset="1" stop-color="#065f46"/>
    </linearGradient>
  </defs>
  <rect x="${inset}" y="${inset}" width="${512 - inset * 2}" height="${512 - inset * 2}" rx="${radius}" fill="url(#g)"/>
  <svg x="${offset}" y="${offset}" width="${markSize}" height="${markSize}" viewBox="0 0 48 48">
    ${paths('fill="#ffffff"')}
  </svg>
</svg>`;
}

const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

/** Packs PNG images into a Windows .ico container. */
function ico(images: { size: number; data: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.data)]);
}

async function icons() {
  const tile = tileSvg(false);
  const bleed = tileSvg(true);
  mkdirSync(META, { recursive: true });

  writeFileSync(
    `${META}/favicon.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><style>path{fill:${EMERALD}}@media (prefers-color-scheme:dark){path{fill:${EMERALD_LIGHT}}}</style>${paths("")}</svg>\n`
  );
  writeFileSync(`${META}/logo.svg`, `${markSvg("#0a0a0a")}\n`);
  writeFileSync("static/orbit.svg", `${tile}\n`);

  const favicon = ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(tile, size) }))));
  writeFileSync(`${META}/favicon.ico`, favicon);
  writeFileSync("static/favicon.ico", favicon);

  const outputs: [string, string, number][] = [
    [`${META}/favicon-96x96.png`, tile, 96],
    [`${META}/apple-touch-icon.png`, bleed, 180],
    [`${META}/web-app-manifest-192x192.png`, tile, 192],
    [`${META}/web-app-manifest-512x512.png`, tile, 512],
    [`${META}/web-app-manifest-maskable-192x192.png`, bleed, 192],
    [`${META}/web-app-manifest-maskable-512x512.png`, bleed, 512],
    ["static/orbit.png", tile, 512],
    ["extension/public/icons/icon16.png", tile, 16],
    ["extension/public/icons/icon32.png", tile, 32],
    ["extension/public/icons/icon48.png", tile, 48],
    ["extension/public/icons/icon128.png", tile, 128],
    [".scratchpad/brand/app-icon-1024.png", tile, 1024],
  ];
  mkdirSync(".scratchpad/brand", { recursive: true });
  for (const [file, svg, size] of outputs) writeFileSync(file, await png(svg, size));
}

async function og() {
  const fonts = [
    readFileSync("node_modules/@fontsource-variable/google-sans/files/google-sans-latin-wght-normal.woff2"),
    readFileSync("node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
  ];
  const dataUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const bigMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none">${paths(`fill="${EMERALD}" fill-opacity="0.09"`)}</svg>`;
  const chip = (label: string) => ({
    type: "container",
    style: { display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", borderRadius: 999, backgroundColor: "#ffffff", border: "1px solid #e5e5e5", flexShrink: 0 },
    children: [
      { type: "container", style: { width: 10, height: 10, borderRadius: 999, backgroundColor: EMERALD } },
      { type: "text", text: label, style: { fontFamily: "Inter", fontSize: 22, fontWeight: 500, color: "#0a0a0a", whiteSpace: "nowrap" } },
    ],
  });

  const tree = {
    type: "container",
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#f5f5f5",
    },
    children: [
      { type: "image", src: dataUri(bigMark), width: 580, height: 580, style: { position: "absolute", right: -200, top: 96 } },
      {
        type: "container",
        style: { position: "absolute", left: 64, top: 0, bottom: 0, width: 1, borderLeft: "1px dashed rgba(10,10,10,0.14)" },
      },
      {
        type: "container",
        style: { position: "absolute", right: 64, top: 0, bottom: 0, width: 1, borderLeft: "1px dashed rgba(10,10,10,0.14)" },
      },
      {
        type: "container",
        style: { position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 96px", width: "100%", height: "100%" },
        children: [
          {
            type: "container",
            style: { display: "flex", alignItems: "center", justifyContent: "space-between" },
            children: [
              {
                type: "container",
                style: { display: "flex", alignItems: "center", gap: 16 },
                children: [
                  { type: "image", src: dataUri(tileSvg(false)), width: 60, height: 60 },
                  { type: "text", text: "Orbit", style: { fontFamily: "Google Sans", fontSize: 40, fontWeight: 600, color: "#0a0a0a", letterSpacing: -0.4 } },
                ],
              },
              { type: "text", text: "orbit.nexonauts.com", style: { fontFamily: "Inter", fontSize: 22, fontWeight: 500, color: "#6b6b6b" } },
            ],
          },
          {
            type: "container",
            style: { display: "flex", flexDirection: "column", gap: 22, maxWidth: 760 },
            children: [
              {
                type: "container",
                style: { display: "flex", flexDirection: "column" },
                children: [
                  { type: "text", text: "PDF tools that never", style: { fontFamily: "Google Sans", fontSize: 78, fontWeight: 500, lineHeight: 1.04, color: "#0a0a0a", letterSpacing: -1.5 } },
                  { type: "text", text: "upload your files", style: { fontFamily: "Google Sans", fontSize: 78, fontWeight: 500, lineHeight: 1.04, color: EMERALD, letterSpacing: -1.5 } },
                ],
              },
              {
                type: "text",
                text: "Merge, compress, sign, edit and convert PDFs on your own device. Free, offline and open source.",
                style: { fontFamily: "Inter", fontSize: 26, lineHeight: 1.45, color: "#525252", maxWidth: 640 },
              },
            ],
          },
          {
            type: "container",
            style: { display: "flex", gap: 12 },
            children: ["60+ tools", "No uploads", "No watermarks", "Works offline"].map(chip),
          },
        ],
      },
    ],
  };

  const renderer = new Renderer();
  const image = await renderer.render(tree as never, { width: 1200, height: 630, fonts });
  writeFileSync("static/og.png", await sharp(image).png({ compressionLevel: 9, palette: false }).toBuffer());
}

await icons();
await og();
console.log("Brand assets written. Run `bunx tauri icon .scratchpad/brand/app-icon-1024.png` for desktop icons.");
