import { IconArrowsExchange, IconBucketDroplet, IconEyeOff, IconRotateClockwise, type Icon } from '$lib/icons';

export type FixOp = 'rotate' | 'flip' | 'strip' | 'watermark';

export interface FixDef {
    slug: string;
    title: string;
    seoTitle: string;
    description: string;
    keywords: string[];
    icon: Icon;
    op: FixOp;
    color: string;
}

const noUpload = ['no upload', 'free', 'offline'];

export const FIX_DEFS: FixDef[] = [
    {
        slug: 'rotate-image',
        title: 'Rotate Image',
        seoTitle: 'Rotate Image 90, 180 or 270 Degrees Online Without Uploading',
        description: 'Turn a photo 90 degrees left or right, or 180 degrees. Fix sideways phone photos. Free, private, and nothing is uploaded.',
        icon: IconRotateClockwise,
        op: 'rotate',
        color: 'text-sky-500',
        keywords: ['rotate image', 'rotate photo', 'rotate jpg', 'rotate image 90 degrees', 'fix sideways photo', 'turn picture', ...noUpload]
    },
    {
        slug: 'flip-image',
        title: 'Flip Image',
        seoTitle: 'Flip or Mirror an Image Online Without Uploading',
        description: 'Mirror a photo left to right or flip it upside down. Free, private, and nothing is uploaded.',
        icon: IconArrowsExchange,
        op: 'flip',
        color: 'text-sky-500',
        keywords: ['flip image', 'mirror image', 'flip photo', 'flip picture horizontally', 'mirror photo', 'flip image vertically', ...noUpload]
    },
    {
        slug: 'remove-exif',
        title: 'Remove Photo Metadata (EXIF)',
        seoTitle: 'Remove EXIF and GPS Location from Photos Without Uploading',
        description: 'Strip the GPS location, camera model and date from photos before you share them. Free, private, and nothing is uploaded.',
        icon: IconEyeOff,
        op: 'strip',
        color: 'text-emerald-500',
        keywords: ['remove exif', 'remove metadata from photo', 'remove gps from photo', 'strip exif data', 'delete photo location', 'exif remover', 'clean photo metadata', ...noUpload]
    },
    {
        slug: 'watermark-image',
        title: 'Add Watermark to Image',
        seoTitle: 'Add a Text Watermark to Photos Online Without Uploading',
        description: 'Put your name or brand as a text watermark across one or many photos. Free, private, and nothing is uploaded.',
        icon: IconBucketDroplet,
        op: 'watermark',
        color: 'text-cyan-500',
        keywords: ['watermark image', 'add watermark to photo', 'text watermark', 'watermark photos online', 'batch watermark', 'protect photos', ...noUpload]
    }
];

export const getFixDef = (slug: string | undefined) => FIX_DEFS.find((d) => d.slug === slug);
