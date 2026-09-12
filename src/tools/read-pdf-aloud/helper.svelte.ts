import { PdfEngine } from '$lib/pdf-engine.svelte';
import { toast } from 'svelte-sonner';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { toParagraphs, toSentences } from './text';

export interface Sentence {
    index: number;
    text: string;
    page: number;
    paragraph: number;
}

export interface Paragraph {
    index: number;
    sentences: Sentence[];
}

export interface ReadPage {
    number: number;
    paragraphs: Paragraph[];
}

export type PlayStatus = 'idle' | 'playing' | 'paused' | 'finished';

const isPdf = (f: File) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');

export class ReadAloudState extends PdfEngine {
    readonly supported =
        typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

    file = $state.raw<File | null>(null);
    pages = $state.raw<ReadPage[]>([]);
    sentences = $state.raw<Sentence[]>([]);
    loaded = $state(false);

    voices = $state.raw<SpeechSynthesisVoice[]>([]);
    voiceURI = $state('');
    rate = $state(1);
    status = $state<PlayStatus>('idle');
    index = $state(0);

    private generation = 0;
    private utterance: SpeechSynthesisUtterance | null = null;
    private timer: ReturnType<typeof setTimeout> | undefined;
    private readonly onVoices = () => this.loadVoices();

    constructor() {
        super();
        if (!this.supported) return;
        this.loadVoices();
        speechSynthesis.addEventListener('voiceschanged', this.onVoices);
    }

    get current(): Sentence | undefined {
        return this.sentences[this.index];
    }

    get voice(): SpeechSynthesisVoice | undefined {
        return this.voices.find((v) => v.voiceURI === this.voiceURI);
    }

    private loadVoices() {
        const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase();
        const base = lang.split('-')[0];
        const rank = (v: SpeechSynthesisVoice) => {
            const l = v.lang.toLowerCase().replace('_', '-');
            return (l === lang ? 0 : l.split('-')[0] === base ? 1 : 2) * 2 + (v.localService ? 0 : 1);
        };
        const voices = speechSynthesis
            .getVoices()
            .slice()
            .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
        this.voices = voices;
        if (!voices.some((v) => v.voiceURI === this.voiceURI)) {
            const preferred =
                voices.find((v) => v.default && v.localService && rank(v) < 4) ??
                voices.find((v) => v.localService && rank(v) < 4) ??
                voices.find((v) => v.default) ??
                voices[0];
            this.voiceURI = preferred?.voiceURI ?? '';
        }
    }

    async loadFile(files: File[]) {
        const file = files.find(isPdf);
        if (!file) {
            toast.error('Please choose a PDF file.');
            return;
        }
        this.stop();
        this.file = file;
        this.pages = [];
        this.sentences = [];
        this.loaded = false;
        this.isProcessing = true;
        try {
            const pdfjs = await this.getPdfJs();
            const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
            const pages: ReadPage[] = [];
            const sentences: Sentence[] = [];
            let paragraphIndex = 0;
            for (let p = 1; p <= doc.numPages; p++) {
                if (this.file !== file) return;
                this.progress = { current: p, total: doc.numPages, text: 'Reading the text' };
                const page = await doc.getPage(p);
                const content = await page.getTextContent();
                const runs = content.items.filter((i): i is TextItem => 'str' in i);
                const paragraphs = toParagraphs(runs).map((text) => {
                    const paragraph: Paragraph = { index: paragraphIndex++, sentences: [] };
                    for (const sentenceText of toSentences(text)) {
                        const sentence = { index: sentences.length, text: sentenceText, page: p, paragraph: paragraph.index };
                        sentences.push(sentence);
                        paragraph.sentences.push(sentence);
                    }
                    return paragraph;
                });
                pages.push({ number: p, paragraphs });
                page.cleanup();
            }
            await doc.destroy();
            if (this.file !== file) return;
            this.pages = pages;
            this.sentences = sentences;
            this.index = 0;
            this.loaded = true;
        } catch (e) {
            console.error('[Read PDF Aloud] Error:', e);
            const locked = e instanceof Error && e.name === 'PasswordException';
            toast.error(locked ? 'This PDF is password protected. Unlock it first.' : 'Could not read this PDF.');
            this.file = null;
        } finally {
            if (this.file === file || this.file === null) this.isProcessing = false;
        }
    }

    play() {
        if (!this.supported || this.sentences.length === 0) return;
        if (this.status === 'finished') this.index = 0;
        this.status = 'playing';
        this.speak(this.index);
    }

    /** Pausing cancels and later restarts the sentence, because native pause is unreliable in Chrome and Android. */
    pause() {
        if (this.status !== 'playing') return;
        this.status = 'paused';
        this.cancel();
    }

    toggle() {
        if (this.status === 'playing') this.pause();
        else this.play();
    }

    stop() {
        this.cancel();
        this.status = 'idle';
        this.index = 0;
    }

    jumpTo(index: number) {
        this.index = Math.max(0, Math.min(this.sentences.length - 1, index));
        if (this.status === 'playing') this.speak(this.index);
        else if (this.status === 'finished') this.status = 'paused';
    }

    startFromPage(page: number) {
        const target = this.sentences.find((s) => s.page >= page);
        if (!target) {
            toast.info(`There is no text from page ${page} on.`);
            return;
        }
        this.index = target.index;
        this.status = 'playing';
        this.speak(target.index);
    }

    setVoice(uri: string) {
        this.voiceURI = uri;
        if (this.status === 'playing') this.speak(this.index);
    }

    setRate(rate: number) {
        this.rate = rate;
        if (this.status === 'playing') this.speak(this.index);
    }

    reset() {
        this.stop();
        this.file = null;
        this.pages = [];
        this.sentences = [];
        this.loaded = false;
        this.isProcessing = false;
    }

    destroy() {
        this.cancel();
        if (this.supported) speechSynthesis.removeEventListener('voiceschanged', this.onVoices);
    }

    private cancel() {
        this.generation++;
        clearTimeout(this.timer);
        if (this.utterance) {
            this.utterance.onend = null;
            this.utterance.onerror = null;
            this.utterance = null;
        }
        if (this.supported && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
    }

    private speak(i: number) {
        const busy = speechSynthesis.speaking || speechSynthesis.pending;
        this.cancel();
        const gen = this.generation;
        if (i >= this.sentences.length) {
            this.status = 'finished';
            return;
        }
        this.index = i;

        const utterance = new SpeechSynthesisUtterance(this.sentences[i].text);
        const voice = this.voice;
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        }
        utterance.rate = this.rate;
        utterance.onend = () => {
            if (gen === this.generation && this.status === 'playing') this.speak(i + 1);
        };
        utterance.onerror = (event) => {
            if (gen !== this.generation || event.error === 'interrupted' || event.error === 'canceled') return;
            console.error('[Read PDF Aloud] Speech error:', event.error);
            this.status = 'paused';
            toast.error(
                event.error === 'network'
                    ? 'This online voice could not connect. Choose a voice that is not marked Online.'
                    : 'Your browser stopped reading. Press play to try again.'
            );
        };
        this.utterance = utterance;

        if (speechSynthesis.paused) speechSynthesis.resume();
        if (busy) this.timer = setTimeout(() => gen === this.generation && speechSynthesis.speak(utterance), 60);
        else speechSynthesis.speak(utterance);
    }
}
