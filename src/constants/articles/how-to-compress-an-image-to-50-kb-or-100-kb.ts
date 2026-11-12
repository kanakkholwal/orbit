import type { Article } from "./index";

const article: Article = {
  slug: "how-to-compress-an-image-to-50-kb-or-100-kb",
  title: "How to Compress an Image to 50 KB, 100 KB or Any Size",
  description:
    "Shrink a photo or scan to an exact file size such as 20 KB, 50 KB, 100 KB or 1 MB. Learn what lowers the size, what costs quality, and how to hit a limit without uploading the image.",
  published: "2026-11-12",
  readingMinutes: 5,
  keywords: [
    "compress image to 50kb",
    "compress image to 100kb",
    "reduce image size in kb",
    "image under 200kb",
    "jpg compressor",
    "reduce photo size",
    "compress image for upload",
    "image size reducer",
  ],
  tools: ["image-compress", "compress-image-to-50kb", "compress-image-to-100kb", "image-resize"],
  body: `Upload boxes love round numbers: 50 KB, 100 KB, 200 KB, 1 MB. If your photo is a few megabytes straight from a phone, you need to cut it down by a factor of ten or more. This guide explains what actually makes an image big and how to hit a limit while keeping it readable.

## What makes an image file big

Three things decide the size of a JPEG or WebP image:

1. **Pixels.** A 4000 x 3000 photo holds twelve million pixels. Most forms do not need more than a tenth of that.
2. **Quality setting.** Lossy formats throw away detail you are unlikely to notice. Lower quality means a smaller file and eventually visible blocks and blur.
3. **Content.** A plain document or a photo with a smooth background compresses far better than a busy scene.

PNG is different. It is lossless and has no quality setting, so the only way to make a PNG much smaller is to reduce its pixels, or to save it as JPG or WebP instead.

## Compress to a target size

1. Open [Compress Image](/tools/image-compress) or jump to a preset such as [Compress Image to 50 KB](/tools/compress-image-to-50kb) or [Compress Image to 100 KB](/tools/compress-image-to-100kb).
2. Add one image or many. Each is processed on your device.
3. Pick a size limit chip, or type your own value in the custom field.
4. Press **Compress**.

Orbit encodes the image again and again, lowering quality step by step. If the lowest sensible quality still does not fit, it also reduces the pixels. The result row turns green and shows how much smaller the file became. If it stays red, the limit was too strict for that image: pick a larger limit or resize it first.

## Tips that work

- **Resize before you compress.** If the form only needs 800 pixels wide, use [Resize Image](/tools/image-resize) first. It cuts the size far more than quality alone.
- **Prefer JPG or WebP for photos.** Use PNG only when you need transparency or crisp flat colour.
- **Check text.** Scanned documents turn blurry first. If a signature or small print becomes unreadable, raise the limit.
- **Compress a copy.** Keep the original. You cannot get the detail back.

## Why do it on your device

Photos of ID cards, signatures and certificates are sensitive. A browser-based tool that runs locally never sends the image to a server, so there is nothing to leak or to delete later.`,
};

export default article;
