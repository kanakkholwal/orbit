import type { ToolContent } from '$constants/tool-content';

const privacy = {
    q: 'Is my photo uploaded anywhere?',
    a: 'No. The image is opened and changed inside your browser or the Orbit app. Nothing is sent to a server, and it works offline after the first load.'
};

export const imageToolContent: Record<string, Partial<ToolContent>> = {
    'photo-for-forms': {
        howItWorks: [
            'Add your photo or scanned signature. HEIC photos from an iPhone work too.',
            'Pick a preset such as passport 35 x 45 mm, 2 x 2 inch, or a 140 x 60 px signature, or type your own width and height.',
            'Drag the crop box so the face or signature sits where you want it. The box keeps the exact shape the form needs.',
            'Set the file size limit the form shows, such as under 50 KB, then press Prepare and download.'
        ],
        useCases: [
            { title: 'Government and exam forms', body: 'Portals often reject a photo for being a few KB too large or the wrong pixel size. Match both in one step.' },
            { title: 'Passport and visa photos', body: 'Crop to 35 x 45 mm or 2 x 2 in at 300 dpi, then print at a shop or upload to the application.' },
            { title: 'Signatures', body: 'Shrink a scanned signature to the small pixel box and KB limit that job and bank forms ask for.' }
        ],
        faqs: [
            { q: 'Are the presets official?', a: 'They are the sizes most forms use, but each form sets its own rules. Check the instructions on your form and edit the size or KB limit if they differ.' },
            { q: 'What if the file stays above the limit?', a: 'Orbit lowers quality first, then shrinks the pixels. If it still cannot fit, it tells you so you can choose a smaller size.' },
            privacy
        ]
    },
    'image-compress': {
        howItWorks: [
            'Add one or many images.',
            'Choose a size limit such as 100 KB, or turn the limit off and drag the quality slider.',
            'Press Compress. Each image is encoded again until it fits the limit.',
            'Download one file, or all of them in a ZIP.'
        ],
        useCases: [
            { title: 'Upload limits', body: 'Get a photo under 20 KB, 100 KB or 1 MB for a form, a portal or an email.' },
            { title: 'Faster pages', body: 'Shrink product photos and blog images so pages load quickly on mobile data.' },
            { title: 'Saving storage', body: 'Cut a folder of phone photos down without opening an editor.' }
        ],
        faqs: [
            { q: 'Which format compresses best?', a: 'WebP and JPG shrink well. PNG has no quality setting, so Orbit can only make a PNG smaller by reducing its pixels.' },
            { q: 'Will it look blurry?', a: 'Orbit uses the highest quality that still fits your limit, so you only lose what the limit forces.' },
            privacy
        ]
    },
    'image-resize': {
        howItWorks: [
            'Add your images.',
            'Pick a preset, or enter a width and height in pixels, millimetres or inches.',
            'Keep proportions on to set only the width, or turn it off and choose Fill, Fit or Stretch.',
            'Press Resize and download.'
        ],
        useCases: [
            { title: 'Social media', body: 'Fit photos to Instagram, story, LinkedIn and WhatsApp sizes.' },
            { title: 'Print sizes', body: 'Enter millimetres and a dpi to get the exact pixel size for a print shop.' },
            { title: 'Website images', body: 'Scale a batch of large photos down to the width your site needs.' }
        ],
        faqs: [
            { q: 'Does resizing reduce quality?', a: 'Making an image smaller keeps it sharp. Making it larger cannot add detail, so avoid scaling far above the original.' },
            privacy
        ]
    },
    'image-crop': {
        howItWorks: [
            'Add a photo.',
            'Choose a shape such as 1:1, 4:5, 16:9 or free.',
            'Drag the box to move it and drag a corner to resize it.',
            'Press Crop and download.'
        ],
        useCases: [
            { title: 'Profile pictures', body: 'Crop to a square so avatars are not cut off by the site.' },
            { title: 'Posts and thumbnails', body: 'Match 4:5, 16:9 or 9:16 without stretching the picture.' },
            { title: 'Removing edges', body: 'Trim a scan or screenshot down to the part you need.' }
        ],
        faqs: [{ q: 'Does cropping change the quality?', a: 'The kept area is not resampled unless you also change the size, so detail is preserved.' }, privacy]
    },
    'image-convert': {
        howItWorks: [
            'Add images in any common format, including HEIC from an iPhone.',
            'Choose JPG, PNG or WebP.',
            'Press Convert.',
            'Download one file or a ZIP of all of them.'
        ],
        useCases: [
            { title: 'iPhone photos', body: 'Turn HEIC into JPG so every device and website can open it.' },
            { title: 'Smaller web images', body: 'Convert PNG and JPG to WebP for faster pages.' },
            { title: 'Transparent graphics', body: 'Save as PNG to keep a see-through background.' }
        ],
        faqs: [{ q: 'Is converting to JPG lossy?', a: 'Yes, JPG is lossy, but at high quality the difference is hard to see. PNG is lossless.' }, privacy]
    }
};
