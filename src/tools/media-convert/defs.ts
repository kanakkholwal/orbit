import { IconHeadphones, IconPlayerPlay, type Icon } from '$lib/icons';
import type { MediaFormatId, MediaKind, MediaQuality } from '$lib/media/convert';

export interface MediaDef {
    slug: string;
    title: string;
    seoTitle: string;
    description: string;
    keywords: string[];
    icon: Icon;
    kind: MediaKind;
    to?: MediaFormatId;
    quality?: MediaQuality;
    maxHeight?: number;
    /** Judge the result green or red by size, as a compress job. */
    judged?: boolean;
    color?: string;
}

const noUpload = ['no upload', 'free', 'offline'];

const base: MediaDef[] = [
    {
        slug: 'video-converter',
        title: 'Video Converter',
        seoTitle: 'Convert Video to MP4, WebM, MKV or MOV Without Uploading',
        description: 'Convert video between MP4, WebM, MKV and MOV in your browser, using your own hardware. Free, no watermark, and your video never leaves the device.',
        icon: IconPlayerPlay,
        kind: 'video',
        color: 'text-violet-500',
        keywords: ['video converter', 'convert video', 'mp4 converter', 'convert video to mp4', 'webm converter', 'mov to mp4', 'video converter no upload', ...noUpload]
    },
    {
        slug: 'audio-converter',
        title: 'Audio Converter',
        seoTitle: 'Convert Audio to MP3, WAV, OGG or FLAC Without Uploading',
        description: 'Convert audio between MP3, M4A, WAV, OGG and FLAC, or pull the sound out of a video. Free, private, and it runs in your browser.',
        icon: IconHeadphones,
        kind: 'audio',
        color: 'text-fuchsia-500',
        keywords: ['audio converter', 'convert audio', 'mp3 converter', 'wav to mp3', 'extract audio from video', 'audio converter no upload', ...noUpload]
    }
];

const video = (slug: string, title: string, to: MediaFormatId, description: string, keywords: string[], extra: Partial<MediaDef> = {}): MediaDef => ({
    slug,
    title,
    seoTitle: `${title} Online Without Uploading`,
    description,
    icon: IconPlayerPlay,
    kind: 'video',
    to,
    color: 'text-violet-500',
    keywords: [...keywords, ...noUpload],
    ...extra
});

const audio = (slug: string, title: string, to: MediaFormatId, description: string, keywords: string[]): MediaDef => ({
    slug,
    title,
    seoTitle: `${title} Online Without Uploading`,
    description,
    icon: IconHeadphones,
    kind: 'audio',
    to,
    color: 'text-fuchsia-500',
    keywords: [...keywords, ...noUpload]
});

const aliases: MediaDef[] = [
    video('mov-to-mp4', 'MOV to MP4', 'mp4', 'Convert iPhone and QuickTime MOV videos to MP4 so they play everywhere. Free, private, and nothing is uploaded.', ['mov to mp4', 'convert mov to mp4', 'iphone video to mp4', 'quicktime to mp4']),
    video('mkv-to-mp4', 'MKV to MP4', 'mp4', 'Convert MKV videos to MP4 for phones, TVs and editors. Free, private, and nothing is uploaded.', ['mkv to mp4', 'convert mkv to mp4']),
    video('webm-to-mp4', 'WebM to MP4', 'mp4', 'Convert WebM videos to MP4. Free, private, and nothing is uploaded.', ['webm to mp4', 'convert webm to mp4']),
    video('mp4-to-webm', 'MP4 to WebM', 'webm', 'Convert MP4 videos to WebM for the web. Free, private, and nothing is uploaded.', ['mp4 to webm', 'convert mp4 to webm']),
    video('compress-video', 'Compress Video', 'mp4', 'Make a video much smaller for WhatsApp, email and upload limits by lowering quality and size to 720p. Free, private, and nothing is uploaded.', ['compress video', 'reduce video size', 'video compressor', 'compress video for whatsapp', 'shrink video file'], { quality: 'low', maxHeight: 720, judged: true }),
    audio('mp4-to-mp3', 'MP4 to MP3', 'mp3', 'Extract the sound of an MP4 video as an MP3 file. Free, private, and nothing is uploaded.', ['mp4 to mp3', 'extract audio from video', 'video to mp3', 'convert mp4 to mp3']),
    audio('video-to-audio', 'Video to Audio', 'mp3', 'Pull the audio out of any video and save it as MP3, M4A, WAV or FLAC. Free, private, and nothing is uploaded.', ['video to audio', 'extract audio', 'video to mp3', 'rip audio from video']),
    audio('wav-to-mp3', 'WAV to MP3', 'mp3', 'Convert WAV recordings to small MP3 files. Free, private, and nothing is uploaded.', ['wav to mp3', 'convert wav to mp3']),
    audio('mp3-to-wav', 'MP3 to WAV', 'wav', 'Convert MP3 files to uncompressed WAV. Free, private, and nothing is uploaded.', ['mp3 to wav', 'convert mp3 to wav']),
    audio('m4a-to-mp3', 'M4A to MP3', 'mp3', 'Convert iPhone M4A voice memos and songs to MP3. Free, private, and nothing is uploaded.', ['m4a to mp3', 'convert m4a to mp3', 'voice memo to mp3']),
    audio('flac-to-mp3', 'FLAC to MP3', 'mp3', 'Convert lossless FLAC to MP3 for phones and players. Free, private, and nothing is uploaded.', ['flac to mp3', 'convert flac to mp3'])
];

export const MEDIA_BASE = base;
export const MEDIA_DEFS: MediaDef[] = [...base, ...aliases];
export const getMediaDef = (slug: string | undefined) => MEDIA_DEFS.find((d) => d.slug === slug);
