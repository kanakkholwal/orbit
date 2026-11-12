import type { Article } from "./index";

const article: Article = {
  slug: "how-to-extract-audio-from-a-video",
  title: "How to Extract Audio From a Video as MP3",
  description:
    "Save the soundtrack of a video as MP3, M4A, WAV or FLAC. Pull the audio out of a lecture, interview or voice note on your own device, with no upload and no sign-up.",
  published: "2026-11-12",
  readingMinutes: 4,
  keywords: [
    "extract audio from video",
    "video to mp3",
    "mp4 to mp3",
    "save audio from video",
    "convert video to audio",
    "audio extractor no upload",
    "wav to mp3",
  ],
  tools: ["video-to-audio", "mp4-to-mp3", "audio-converter", "wav-to-mp3"],
  body: `Sometimes you only want the sound: a lecture to listen to on a walk, an interview to transcribe, a voice note someone sent as a video. You can pull the audio track out of the video without re-recording anything.

## Extract the audio

1. Open [Video to Audio](/tools/video-to-audio), or [MP4 to MP3](/tools/mp4-to-mp3) if that is the exact job.
2. Add the video. MP4, MOV, MKV and WebM all work.
3. Choose the format to save as. **MP3** is the most compatible, **M4A** is similar in quality at a small size, **WAV** and **FLAC** are lossless and larger.
4. Pick a quality. Medium suits speech. Choose high for music.
5. Press **Convert** and download the file.

## Which format to choose

- **MP3** plays on practically every device and app.
- **M4A** gives slightly better quality than MP3 at the same size, and is native on Apple devices.
- **WAV** is uncompressed. It is the right choice if you will edit the sound afterwards.
- **FLAC** is lossless but smaller than WAV.

## If it says there is no audio

Some videos, such as screen recordings or clips from a camera with the microphone off, have no audio track at all. Orbit tells you so, instead of producing an empty file.

## Convert between audio formats

Already have audio in the wrong format, such as WAV recordings or iPhone M4A voice memos? Use [Audio Converter](/tools/audio-converter), or the direct [WAV to MP3](/tools/wav-to-mp3) page.

## Privacy

Recordings of meetings and conversations are private. The conversion runs on your device, so the video never leaves it. MP3 and FLAC encoders load on first use and are then kept for offline use.`,
};

export default article;
