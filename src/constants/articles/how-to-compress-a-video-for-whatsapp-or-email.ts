import type { Article } from "./index";

const article: Article = {
  slug: "how-to-compress-a-video-for-whatsapp-or-email",
  title: "How to Compress a Video for WhatsApp or Email",
  description:
    "Make a video small enough to send. Lower the quality and size, switch to MP4, and shrink a clip on your own device without uploading it or adding a watermark.",
  published: "2026-11-12",
  readingMinutes: 5,
  keywords: [
    "compress video",
    "reduce video size",
    "compress video for whatsapp",
    "video too large to email",
    "shrink video file",
    "convert mov to mp4",
    "video compressor no upload",
  ],
  tools: ["compress-video", "video-converter", "video-to-audio", "mov-to-mp4"],
  body: `A short phone video can be hundreds of megabytes. Messaging apps and email set limits far below that, and they differ by app and change over time, so check the current figure for yours. This guide shows how to shrink a video until it fits, and what you give up.

## Why videos are so large

Video size is roughly the length multiplied by the bitrate, which is how much data each second needs. Phones record at high resolution and high bitrate so the footage looks good on a big screen. For a chat message or an email, you rarely need that.

Three levers reduce it:

1. **Resolution.** Going from 4K or 1080p down to 720p cuts the data a lot and still looks fine on a phone.
2. **Quality.** Lower quality means a lower bitrate.
3. **Format.** MP4 plays almost everywhere and compresses well. MOV from an iPhone is often larger.

## Compress a video

1. Open [Compress Video](/tools/compress-video).
2. Add the clip. Long or 4K files take time because the work happens on your own device.
3. The tool starts at **Small** quality and a maximum height of **720p**. Adjust either one if the result is too soft or still too big.
4. Press **Convert**. The row shows the new size and turns green when the file got smaller.
5. Download the MP4.

## What you give up

Compression is lossy. At small quality you will see softness in fast motion and in dark areas. If the result looks poor, try **Medium** quality or keep 1080p, then check the size again.

## Just need the sound?

If the picture does not matter, extract the audio with [Video to Audio](/tools/video-to-audio). An MP3 of a few minutes is a fraction of the size of the video.

## Large files and your device

Because nothing is uploaded, the limit is your device's memory and storage. Orbit reads what your device can handle and tells you if a file is too large. On a phone, convert one clip at a time. Converted video is written to temporary storage on supported browsers instead of memory, which keeps long clips from crashing the tab.`,
};

export default article;
