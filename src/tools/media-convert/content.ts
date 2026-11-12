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
    }
};
