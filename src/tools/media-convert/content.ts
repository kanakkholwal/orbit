import type { ToolContent } from '$constants/tool-content';

const privacy = {
    q: 'Is my video or audio uploaded?',
    a: 'No. Conversion runs in your browser or the Orbit app using your own device. The file never goes to a server, and it works offline after the first load.'
};
const limits = {
    q: 'Why is a large video slow or failing?',
    a: 'Everything runs on your device, so long or 4K videos need time and memory. On a phone, try one file at a time or lower the quality. Very large files can run out of memory.'
};

export const mediaToolContent: Record<string, Partial<ToolContent>> = {
    'video-converter': {
        howItWorks: ['Add one or more videos.', 'Choose MP4, WebM, MKV or MOV.', 'Pick a quality and, if you like, a smaller size.', 'Press Convert and download.'],
        useCases: [
            { title: 'Phone and TV playback', body: 'Turn MOV and MKV files into MP4, which plays almost everywhere.' },
            { title: 'Web video', body: 'Save WebM for sites that prefer it.' },
            { title: 'Smaller files', body: 'Lower quality or size to fit upload limits.' }
        ],
        faqs: [{ q: 'Does it support every format?', a: 'It reads common video and audio formats. Support depends on what your browser can decode, and the tool tells you if a file cannot be converted.' }, limits, privacy]
    },
    'audio-converter': {
        howItWorks: ['Add audio files, or videos to pull the sound from.', 'Choose MP3, M4A, WAV, OGG or FLAC.', 'Press Convert.', 'Download one file or a ZIP.'],
        useCases: [
            { title: 'Voice memos', body: 'Convert M4A recordings to MP3 for sharing.' },
            { title: 'Music libraries', body: 'Change FLAC and WAV into small MP3 files.' },
            { title: 'Audio from video', body: 'Save the soundtrack of a video as an audio file.' }
        ],
        faqs: [{ q: 'Which format sounds best?', a: 'WAV and FLAC are lossless. MP3 and M4A are smaller with a small loss that most people cannot hear at high quality.' }, privacy]
    },
    'mute-video': {
        howItWorks: ['Add a video.', 'Press Convert.', 'Download the silent MP4.'],
        useCases: [
            { title: 'Background clips', body: 'Drop the original sound before adding your own music.' },
            { title: 'Private footage', body: 'Remove voices or noise before sharing.' },
            { title: 'Autoplay embeds', body: 'Silent video plays automatically on most pages.' }
        ],
        faqs: [{ q: 'Does the picture get worse?', a: 'The video is re-encoded at the quality you choose. High keeps it close to the original.' }, privacy, limits]
    },
    'rotate-video': {
        howItWorks: ['Add a video.', 'Pick 90 degrees right, 180, or 90 degrees left. Turn on Mirror to flip it.', 'Press Convert and download.'],
        useCases: [
            { title: 'Sideways phone clips', body: 'Fix a video filmed in the wrong orientation.' },
            { title: 'Upside-down footage', body: 'Turn a clip 180 degrees.' },
            { title: 'Selfie mirror', body: 'Flip a front-camera video back to normal.' }
        ],
        faqs: [{ q: 'Is the rotation permanent?', a: 'Yes. It is baked into the video frames, so every player shows it the same way.' }, privacy, limits]
    },
    'trim-video': {
        howItWorks: ['Add a video.', 'Set the start and end in seconds. Leave the end at 0 to keep everything after the start.', 'Press Convert and download the clip.'],
        useCases: [
            { title: 'Cut the dead air', body: 'Remove the start or end of a recording.' },
            { title: 'Short clips', body: 'Save the one moment you want to share.' },
            { title: 'Smaller files', body: 'A shorter video is also a smaller one.' }
        ],
        faqs: [{ q: 'Can I cut from the middle?', a: 'This tool keeps one range. To remove a middle part, trim twice and join the pieces.' }, privacy, limits]
    },
    'trim-audio': {
        howItWorks: ['Add an MP3 or other audio file.', 'Set the start and end in seconds. Leave the end at 0 to keep everything after the start.', 'Press Convert and download the clip.'],
        useCases: [
            { title: 'Ringtones', body: 'Cut your favourite 30 seconds of a song.' },
            { title: 'Voice notes', body: 'Remove silence at the start or end of a recording.' },
            { title: 'Podcast clips', body: 'Save a short quote to share.' }
        ],
        faqs: [{ q: 'Which format is the clip saved in?', a: 'MP3 by default. Pick M4A, WAV, OGG or FLAC in the options.' }, privacy]
    }
};
