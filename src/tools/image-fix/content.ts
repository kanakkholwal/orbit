import type { ToolContent } from '$constants/tool-content';

const privacy = {
    q: 'Are my photos uploaded?',
    a: 'No. The photo is processed in your browser or the Orbit app. It never goes to a server, and it works offline after the first load.'
};

export const imageFixContent: Record<string, Partial<ToolContent>> = {
    'rotate-image': {
        howItWorks: ['Add one or more photos.', 'Pick 90 degrees right, 180, or 90 degrees left.', 'Press Rotate and download.'],
        useCases: [
            { title: 'Sideways phone photos', body: 'Fix a picture that opens turned on its side.' },
            { title: 'Scanned pages', body: 'Turn a scan the right way up before you share it.' },
            { title: 'Batches', body: 'Rotate many photos in one go and download a ZIP.' }
        ],
        faqs: [{ q: 'Does rotating lower the quality?', a: 'The photo is saved again at high quality in its own format, so the change is not visible.' }, privacy]
    },
    'flip-image': {
        howItWorks: ['Add one or more photos.', 'Choose left to right, or upside down.', 'Press Flip and download.'],
        useCases: [
            { title: 'Selfies', body: 'Undo the mirror effect of a front camera.' },
            { title: 'Design', body: 'Mirror a picture to face the other way.' },
            { title: 'Prints and iron-ons', body: 'Flip text so it reads correctly after transfer.' }
        ],
        faqs: [privacy]
    },
    'remove-exif': {
        intro: 'Remove Photo Metadata strips the GPS location, camera model, date and other hidden data from your photos, so you can share them without giving away where they were taken.',
        howItWorks: ['Add one or more photos.', 'Press Clean.', 'Download the photos. They look the same but carry no hidden data.'],
        useCases: [
            { title: 'Marketplace listings', body: 'Hide your home location in photos you post for sale.' },
            { title: 'Social media', body: 'Share pictures without a map pin attached.' },
            { title: 'Press and legal', body: 'Send photos without camera serial numbers or timestamps.' }
        ],
        faqs: [
            { q: 'What is removed?', a: 'Everything stored outside the pixels: GPS position, camera and lens, date and time, software and any embedded thumbnail. The photo is redrawn and saved as a new file.' },
            { q: 'Does it change how the photo looks?', a: 'No. The orientation is kept and the quality is high, so it looks the same.' },
            privacy
        ]
    },
    'watermark-image': {
        howItWorks: ['Add one or more photos.', 'Type your text and set the opacity and size.', 'Choose a repeated mark or a single one in the centre.', 'Press Watermark and download.'],
        useCases: [
            { title: 'Portfolios', body: 'Put your name across photos you share online.' },
            { title: 'Draft proofs', body: 'Mark a design as a draft before a client pays.' },
            { title: 'Documents', body: 'Add a mark like "Copy" to a scanned photo of an ID.' }
        ],
        faqs: [{ q: 'Can I add a logo?', a: 'This tool adds text. A logo option is planned.' }, privacy]
    }
};
