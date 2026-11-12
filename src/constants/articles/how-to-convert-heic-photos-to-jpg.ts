import type { Article } from "./index";

const article: Article = {
  slug: "how-to-convert-heic-photos-to-jpg",
  title: "How to Convert iPhone HEIC Photos to JPG",
  description:
    "iPhone photos save as HEIC, which many sites and Windows apps cannot open. Convert HEIC to JPG in bulk on your own device, keep the quality, and learn how to stop it happening again.",
  published: "2026-11-12",
  readingMinutes: 4,
  keywords: [
    "heic to jpg",
    "convert heic to jpg",
    "iphone photo to jpg",
    "heic to jpeg",
    "open heic on windows",
    "heic converter no upload",
    "change iphone photo format",
  ],
  tools: ["heic-to-jpg", "image-convert", "image-compress", "photo-for-forms"],
  body: `You airdrop a photo to a PC, or try to upload it to a form, and it will not open. The file ends in .heic. This guide explains what that is and how to turn it into a JPG that works everywhere.

## What HEIC is

HEIC is the default photo format on recent iPhones. It stores the same picture in roughly half the space of a JPG, which is why Apple chose it. The catch is compatibility: many websites, older Windows versions, some printers and plenty of upload forms only accept JPG or PNG.

## Convert HEIC to JPG

1. Open [HEIC to JPG](/tools/heic-to-jpg).
2. Add your photos. You can select dozens at once.
3. Check that the format says **JPG** and set the quality. High quality keeps the picture looking the same.
4. Press **Convert** and download. With several files you get one ZIP.

The conversion happens in your browser. The photos are not uploaded, which matters because phone photos often contain faces, documents and the location they were taken in.

## What you keep and what you lose

JPG is lossy, so each conversion discards a little detail, but at high quality you will not see the difference. The picture's orientation is kept so photos do not come out sideways. Some extras, such as Live Photo motion or depth data, belong to HEIC and are not carried over.

## If you then need it smaller

A phone photo is several megabytes. If a form wants it under a size limit, run the converted file through [Compress Image](/tools/image-compress), or use [Photo and Signature for Forms](/tools/photo-for-forms) to crop and size it in one go.

## Stop it happening again

On an iPhone, open Settings, then Camera, then Formats, and choose **Most Compatible**. New photos will be saved as JPG. The files will be larger, so it is a trade between space and compatibility. You can also change it back at any time.`,
};

export default article;
