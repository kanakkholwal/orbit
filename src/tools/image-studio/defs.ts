import type { OutputFormat } from '$lib/image/codec';
import {
    IconArrowsExchange,
    IconCrop,
    IconGauge,
    IconId,
    IconPhotoUp,
    IconSignature,
    type Icon
} from '$lib/icons';

export type StudioMode = 'resize' | 'compress' | 'crop' | 'convert' | 'form';

export interface StudioDef {
    slug: string;
    title: string;
    seoTitle: string;
    description: string;
    keywords: string[];
    icon: Icon;
    mode: StudioMode;
    presetId?: string;
    format?: OutputFormat;
    /** Aspect id from ASPECTS, for crop tools. */
    aspect?: string;
    color?: string;
}

const noUpload = ['no upload', 'free', 'offline'];

const base: StudioDef[] = [
    {
        slug: 'image-compress',
        title: 'Compress Image',
        seoTitle: 'Compress Image to a Target Size (KB or MB) Without Uploading',
        description:
            'Compress JPG, PNG and WebP images to an exact size like 20 KB, 100 KB or 1 MB, or pick the quality yourself. Free, private, and it runs in your browser.',
        icon: IconGauge,
        mode: 'compress',
        color: 'text-yellow-500',
        keywords: ['compress image', 'reduce image size', 'compress image to kb', 'image compressor', 'compress jpg', 'compress png', 'reduce photo size', 'image size reducer', ...noUpload]
    },
    {
        slug: 'image-resize',
        title: 'Resize Image',
        seoTitle: 'Resize Image to Exact Pixels, mm or Inches Without Uploading',
        description:
            'Resize a photo to exact pixels, millimetres or inches, or use a preset for passports, social media and forms. Free, private, and nothing is uploaded.',
        icon: IconPhotoUp,
        mode: 'resize',
        color: 'text-sky-500',
        keywords: ['resize image', 'image resizer', 'resize photo', 'change image dimensions', 'resize image in pixels', 'resize image in mm', 'resize image online', ...noUpload]
    },
    {
        slug: 'image-crop',
        title: 'Crop Image',
        seoTitle: 'Crop Image to Any Ratio Online Without Uploading',
        description:
            'Crop a photo freehand or to 1:1, 4:5, 16:9 and passport ratios. Drag the box on a phone or desktop. Free, private, and nothing is uploaded.',
        icon: IconCrop,
        mode: 'crop',
        color: 'text-pink-500',
        keywords: ['crop image', 'crop photo', 'image cropper', 'crop picture online', 'crop image to square', 'crop image to ratio', ...noUpload]
    },
    {
        slug: 'image-convert',
        title: 'Convert Image',
        seoTitle: 'Convert Images to JPG, PNG or WebP Without Uploading',
        description:
            'Convert HEIC, JPG, PNG, WebP and AVIF images to JPG, PNG or WebP in bulk. Free, private, and it runs in your browser.',
        icon: IconArrowsExchange,
        mode: 'convert',
        color: 'text-orange-500',
        keywords: ['image converter', 'convert image', 'convert jpg to png', 'convert png to jpg', 'convert heic to jpg', 'webp to jpg', 'batch image converter', ...noUpload]
    },
    {
        slug: 'photo-for-forms',
        title: 'Photo and Signature for Forms',
        seoTitle: 'Resize Photo and Signature for Online Forms (Exact Size and KB)',
        description:
            'Crop and resize a photo or signature to the size and KB limit an online form asks for. Passport, visa, ID and exam presets, or enter your own. Free and private.',
        icon: IconId,
        mode: 'form',
        presetId: 'passport-35x45',
        color: 'text-emerald-600',
        keywords: ['photo for form', 'resize photo for application form', 'passport size photo maker', 'signature resize', 'photo and signature resizer', 'resize image to 20kb', 'exam form photo size', 'government form photo', ...noUpload]
    }
];

const form = (
    slug: string,
    title: string,
    presetId: string,
    description: string,
    keywords: string[],
    icon: Icon = IconId
): StudioDef => ({
    slug,
    title,
    seoTitle: `${title}: Exact Size, No Upload`,
    description,
    icon,
    mode: 'form',
    presetId,
    color: 'text-emerald-600',
    keywords: [...keywords, ...noUpload]
});

const presets: StudioDef[] = [
    form('passport-size-photo', 'Passport Size Photo Maker', 'passport-35x45', 'Crop any portrait to 35 x 45 mm at 300 dpi, the size most passport and visa forms ask for. Free, private, and nothing is uploaded.', ['passport size photo', 'passport photo maker', '35x45 mm photo', 'make passport photo at home', 'passport photo online']),
    form('us-visa-photo', 'US Visa and Passport Photo 2x2', 'passport-2x2', 'Crop and resize a photo to the 2 x 2 inch (600 x 600 px) square used for US passports and visas. Free, private, and nothing is uploaded.', ['2x2 photo', 'us visa photo', 'us passport photo size', '600x600 photo', 'dv lottery photo']),
    form('signature-resizer', 'Signature Resizer', 'sig-140x60', 'Resize a scanned signature to 140 x 60 px under 20 KB, or choose another size. Free, private, and nothing is uploaded.', ['signature resizer', 'resize signature', 'signature size 140x60', 'signature under 20kb', 'compress signature'], IconSignature),
    form('exam-photo-resizer', 'Exam Form Photo Resizer', 'exam-200x230', 'Resize a photo to 200 x 230 px under 50 KB for entrance and recruitment forms. Free, private, and nothing is uploaded.', ['exam photo resize', 'photo 200x230', 'photo under 50kb', 'recruitment form photo', 'resize photo for exam form'])
];

const limit = (kb: number): StudioDef => {
    const label = kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`;
    const slugSize = kb >= 1024 ? `${kb / 1024}mb` : `${kb}kb`;
    return {
        slug: `compress-image-to-${slugSize}`,
        title: `Compress Image to ${label}`,
        seoTitle: `Compress Image to ${label} Online Without Uploading`,
        description: `Shrink a JPG, PNG or WebP image to under ${label}. The tool lowers quality, then size, until the file fits. Free, private, and nothing is uploaded.`,
        icon: IconGauge,
        mode: 'compress',
        presetId: `under-${kb}kb`,
        color: 'text-yellow-500',
        keywords: [`compress image to ${slugSize}`, `reduce image size to ${slugSize}`, `image under ${slugSize}`, `jpg to ${slugSize}`, `photo ${slugSize}`, ...noUpload]
    };
};

const sizeLimits = [20, 50, 100, 200, 500, 1024].map(limit);

const convert = (from: string, to: string, format: OutputFormat, extra: string[] = []): StudioDef => ({
    slug: `${from.toLowerCase()}-to-${to.toLowerCase()}`,
    title: `${from} to ${to}`,
    seoTitle: `Convert ${from} to ${to} Online Without Uploading`,
    description: `${from} to ${to} converts your images in your browser, in bulk. Free, private, and nothing is uploaded.`,
    icon: IconArrowsExchange,
    mode: 'convert',
    format,
    color: 'text-orange-500',
    keywords: [`${from.toLowerCase()} to ${to.toLowerCase()}`, `convert ${from.toLowerCase()} to ${to.toLowerCase()}`, `${from.toLowerCase()} to ${to.toLowerCase()} converter`, ...extra, ...noUpload]
});

const conversions = [
    convert('PNG', 'JPG', 'jpeg'),
    convert('JPG', 'PNG', 'png'),
    convert('WebP', 'JPG', 'jpeg', ['webp to jpeg']),
    convert('HEIC', 'JPG', 'jpeg', ['iphone photo to jpg', 'heic to jpeg']),
    convert('JPG', 'WebP', 'webp'),
    convert('PNG', 'WebP', 'webp')
];

const social: StudioDef[] = [
    {
        slug: 'crop-image-to-square',
        title: 'Crop Image to Square',
        seoTitle: 'Crop Image to a Square (1:1) Without Uploading',
        description: 'Crop any photo to a 1:1 square for profile pictures and Instagram posts. Free, private, and nothing is uploaded.',
        icon: IconCrop,
        mode: 'crop',
        aspect: '1:1',
        color: 'text-pink-500',
        keywords: ['crop image to square', 'square crop', '1:1 crop', 'profile picture crop', ...noUpload]
    },
    {
        slug: 'resize-image-for-instagram',
        title: 'Resize Image for Instagram',
        seoTitle: 'Resize Image for Instagram Posts, Portraits and Stories',
        description: 'Fit a photo to Instagram square, portrait or story sizes without stretching it. Free, private, and nothing is uploaded.',
        icon: IconPhotoUp,
        mode: 'resize',
        presetId: 'ig-square',
        color: 'text-sky-500',
        keywords: ['resize image for instagram', 'instagram photo size', 'instagram post size', 'instagram story size', ...noUpload]
    }
];

export const STUDIO_BASE = base;
export const STUDIO_DEFS: StudioDef[] = [...base, ...presets, ...sizeLimits, ...conversions, ...social];

export const getStudioDef = (slug: string | undefined) => STUDIO_DEFS.find((d) => d.slug === slug);
