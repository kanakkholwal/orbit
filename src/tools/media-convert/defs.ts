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
    /** Shows the matching control and keeps the rest of the converter as is. */
    op?: 'mute' | 'rotate' | 'trim';
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

const editor = (def: Omit<MediaDef, 'seoTitle' | 'icon' | 'color'> & { seoTitle?: string }): MediaDef => ({
    ...def,
    seoTitle: def.seoTitle ?? `${def.title} Online Without Uploading`,
    icon: def.kind === 'audio' ? IconHeadphones : IconPlayerPlay,
    color: def.kind === 'audio' ? 'text-fuchsia-500' : 'text-violet-500',
    keywords: [...def.keywords, ...noUpload]
});

const editors: MediaDef[] = [
    editor({
        slug: 'mute-video',
        title: 'Remove Audio from Video',
        description: 'Strip the sound from a video and keep the picture. Free, private, and nothing is uploaded.',
        kind: 'video',
        to: 'mp4',
        op: 'mute',
        keywords: ['remove audio from video', 'mute video', 'video without sound', 'delete audio from video', 'silence video']
    }),
    editor({
        slug: 'rotate-video',
        title: 'Rotate Video',
        description: 'Turn a sideways or upside-down video 90, 180 or 270 degrees, or flip it. Free, private, and nothing is uploaded.',
        kind: 'video',
        to: 'mp4',
        op: 'rotate',
        keywords: ['rotate video', 'flip video', 'rotate video 90 degrees', 'fix sideways video', 'mirror video']
    }),
    editor({
        slug: 'trim-video',
        title: 'Trim Video',
        description: 'Cut a video to the part you want by start and end time. Free, private, and nothing is uploaded.',
        kind: 'video',
        to: 'mp4',
        op: 'trim',
        keywords: ['trim video', 'cut video', 'video cutter', 'video trimmer', 'cut video online', 'clip video']
    }),
    editor({
        slug: 'trim-audio',
        title: 'Cut MP3 and Audio',
        seoTitle: 'Cut MP3 and Trim Audio Online Without Uploading',
        description: 'Cut an MP3 or any audio file to a start and end time, for ringtones and clips. Free, private, and nothing is uploaded.',
        kind: 'audio',
        to: 'mp3',
        op: 'trim',
        keywords: ['cut mp3', 'trim audio', 'audio cutter', 'mp3 cutter', 'ringtone maker', 'cut audio online']
    })
];

const more: MediaDef[] = [
    audio('ogg-to-mp3', 'OGG to MP3', 'mp3', 'Convert OGG audio to MP3. Free, private, and nothing is uploaded.', ['ogg to mp3', 'convert ogg to mp3']),
    audio('m4a-to-wav', 'M4A to WAV', 'wav', 'Convert M4A audio to WAV. Free, private, and nothing is uploaded.', ['m4a to wav', 'convert m4a to wav']),
    audio('mp3-to-ogg', 'MP3 to OGG', 'ogg', 'Convert MP3 files to OGG. Free, private, and nothing is uploaded.', ['mp3 to ogg', 'convert mp3 to ogg']),
    video('mov-to-webm', 'MOV to WebM', 'webm', 'Convert MOV videos to WebM. Free, private, and nothing is uploaded.', ['mov to webm', 'convert mov to webm']),
    video('mp4-to-mov', 'MP4 to MOV', 'mov', 'Convert MP4 videos to MOV. Free, private, and nothing is uploaded.', ['mp4 to mov', 'convert mp4 to mov']),
    video('mp4-to-mkv', 'MP4 to MKV', 'mkv', 'Convert MP4 videos to MKV. Free, private, and nothing is uploaded.', ['mp4 to mkv', 'convert mp4 to mkv']),
    video('compress-video-for-email', 'Compress Video for Email', 'mp4', 'Shrink a video to 480p so it fits an email or chat attachment limit. Free, private, and nothing is uploaded.', ['compress video for email', 'reduce video size for email', 'video too large to email', 'compress video to 10mb'], { quality: 'low', maxHeight: 480, judged: true }),
    video('compress-video-whatsapp', 'Compress Video for WhatsApp', 'mp4', 'Shrink a video to 480p so WhatsApp sends it fast. Free, private, and nothing is uploaded.', ['compress video for whatsapp', 'whatsapp video size', 'reduce video size whatsapp'], { quality: 'low', maxHeight: 480, judged: true }),
    video('4k-to-1080p', '4K to 1080p Video', 'mp4', 'Scale a 4K video down to 1080p to save space. Free, private, and nothing is uploaded.', ['4k to 1080p', 'convert 4k video to 1080p', 'reduce 4k video size'], { maxHeight: 1080, judged: true }),
    video('1080p-to-720p', '1080p to 720p Video', 'mp4', 'Scale a 1080p video down to 720p to save space. Free, private, and nothing is uploaded.', ['1080p to 720p', 'convert 1080p to 720p', 'reduce video resolution'], { maxHeight: 720, judged: true })
];

export const MEDIA_BASE = base;
export const MEDIA_DEFS: MediaDef[] = [...base, ...aliases, ...editors, ...more];
export const getMediaDef = (slug: string | undefined) => MEDIA_DEFS.find((d) => d.slug === slug);
