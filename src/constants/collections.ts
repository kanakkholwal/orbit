import {
    IconFileText,
    IconHeadphones,
    IconId,
    IconPhoto,
    IconStack2,
    type Icon
} from '$lib/icons';

export interface Collection {
    id: string;
    title: string;
    description: string;
    icon: Icon;
    /** Explore group this collection links to, if any. */
    category?: string;
    /** Tool slugs shown as quick links. */
    links: string[];
}

/** Curated jobs, shown on Explore and the landing page. Slugs that do not exist are skipped. */
export const collections: Collection[] = [
    {
        id: 'forms',
        title: 'Forms and applications',
        description: 'Exact photo, signature and file sizes for government, exam and visa forms.',
        icon: IconId,
        links: ['passport-size-photo', 'signature-resizer', 'compress-image-to-50kb', 'compress-pdf-to-200kb', 'us-visa-photo', 'exam-photo-resizer']
    },
    {
        id: 'photos',
        title: 'Photos',
        description: 'Resize, crop, compress and convert.',
        icon: IconPhoto,
        category: 'images',
        links: ['image-compress', 'image-resize', 'image-crop', 'image-convert']
    },
    {
        id: 'pdf',
        title: 'PDF essentials',
        description: 'The everyday jobs.',
        icon: IconStack2,
        category: 'essentials',
        links: ['merge-pdf', 'split-pdf', 'compress-pdf', 'rotate-pdf']
    },
    {
        id: 'media',
        title: 'Video and audio',
        description: 'Convert, shrink and extract sound.',
        icon: IconHeadphones,
        category: 'media',
        links: ['video-converter', 'compress-video', 'audio-converter', 'video-to-audio']
    },
    {
        id: 'documents',
        title: 'Documents',
        description: 'Word, Markdown, HTML and EPUB.',
        icon: IconFileText,
        category: 'conversion',
        links: ['document-converter', 'word-to-pdf', 'md-to-pdf', 'pdf-to-docx']
    }
];

/** Grid span of each collection in the six-column bento. */
export const collectionSpan: Record<string, string> = {
    forms: 'md:col-span-4',
    photos: 'md:col-span-2',
    pdf: 'md:col-span-2',
    media: 'md:col-span-2',
    documents: 'md:col-span-2'
};
