import type { Article } from "./index";

const article: Article = {
  slug: "how-to-resize-a-photo-for-a-passport-or-visa-form",
  title: "How to Resize a Photo for a Passport or Visa Form",
  description:
    "Get a photo to the exact size an online form asks for: 35 x 45 mm, 2 x 2 inch, a pixel size or a KB limit. Crop, resize and compress on your own device without uploading it.",
  published: "2026-11-12",
  readingMinutes: 5,
  keywords: [
    "resize photo for passport",
    "passport size photo online",
    "35x45 mm photo",
    "2x2 inch photo",
    "visa photo size",
    "resize photo for application form",
    "photo under 50kb",
    "passport photo kb limit",
  ],
  tools: ["photo-for-forms", "passport-size-photo", "us-visa-photo", "image-crop"],
  body: `Online forms are strict about photos. One asks for 35 x 45 mm, another for exactly 600 x 600 pixels, and the upload box rejects anything over 100 KB. This guide shows how to get one photo to every one of those sizes without sending it to a stranger's server.

## First, read what the form actually asks for

Forms usually state up to three separate rules, and a photo has to meet all of them:

- **Physical size**, such as 35 x 45 mm or 2 x 2 inches. This matters for printing.
- **Pixel size**, such as 413 x 531 pixels or at least 600 x 600. This matters for uploads.
- **File size**, such as under 50 KB or between 20 and 100 KB. Many portals check this and nothing else.

The presets in Orbit are the sizes most forms use, not official rules. Always check your own form's instructions and change a value if it differs.

## Step by step

1. Open [Photo and Signature for Forms](/tools/photo-for-forms), or go straight to [Passport Size Photo Maker](/tools/passport-size-photo) or [US Visa and Passport Photo 2x2](/tools/us-visa-photo).
2. Add your photo. iPhone HEIC photos work too.
3. Pick a preset such as **Passport 35 x 45 mm** or **2 x 2 in**, or choose Custom and type the width, height and unit. For millimetres and inches, the pixels per inch decides the final pixel size, and 300 is the usual choice for print.
4. Drag the crop box so the face sits where the guidance says, usually centred with the top of the head near the top edge. The box keeps the exact shape, so you cannot stretch the photo by accident.
5. If the form has a KB limit, turn on **Limit file size** and enter it. Orbit lowers the JPEG quality first, then the pixel size, until the file fits.
6. Press **Prepare** and download.

## Why the file is sometimes still too big

JPEG size depends on how much detail the picture holds. A sharp photo with a busy background needs more bytes than one with a plain wall behind it. If a 20 KB limit is too small, retake the photo against a plain background, or make the pixel size a little smaller. Shrinking the pixels cuts the file size faster than lowering quality.

If the limit also has a minimum, enter it in the **At least** field so a photo that compresses too hard is not rejected.

## Keep the original

Resizing throws away pixels. Always keep the original photo and make a separate copy for each form. A single high-resolution original lets you produce a 35 x 45 mm print and a 100 KB upload from the same source.

## Privacy

Photos of your face are exactly the kind of file you should not upload to a random converter site. Orbit opens the photo on your device, does the crop and resize there, and never sends it anywhere. It also works offline after the first load.`,
};

export default article;
