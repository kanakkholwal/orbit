import { IconBraces, IconFileText, IconTable, IconLock, type Icon } from '$lib/icons';
import { base64Decode, base64Encode, csvToJson, formatJson, jsonToCsv, minifyJson, srtToVtt, vttToSrt } from './transforms';

export interface TextDef {
    slug: string;
    title: string;
    seoTitle: string;
    description: string;
    keywords: string[];
    icon: Icon;
    color: string;
    inputLabel: string;
    outputLabel: string;
    placeholder: string;
    accept: string;
    /** Extension of the downloaded result. */
    outExt: string;
    run: (input: string) => string;
}

const noUpload = ['no upload', 'free', 'offline'];

export const TEXT_DEFS: TextDef[] = [
    {
        slug: 'json-formatter',
        title: 'JSON Formatter and Validator',
        seoTitle: 'JSON Formatter and Validator Online, Nothing Uploaded',
        description: 'Pretty-print, validate and minify JSON. Errors are explained in plain words. Free, and your data never leaves your device.',
        keywords: ['json formatter', 'json validator', 'json beautifier', 'pretty print json', 'minify json', 'format json online', ...noUpload],
        icon: IconBraces,
        color: 'text-amber-500',
        inputLabel: 'JSON',
        outputLabel: 'Formatted JSON',
        placeholder: '{"name":"Ana","tags":["a","b"]}',
        accept: '.json,application/json,.txt',
        outExt: 'json',
        run: formatJson
    },
    {
        slug: 'minify-json',
        title: 'Minify JSON',
        seoTitle: 'Minify JSON Online, Nothing Uploaded',
        description: 'Remove spaces and line breaks from JSON to make it smaller. Free, and your data never leaves your device.',
        keywords: ['minify json', 'compress json', 'json minifier', 'remove whitespace from json', ...noUpload],
        icon: IconBraces,
        color: 'text-amber-500',
        inputLabel: 'JSON',
        outputLabel: 'Minified JSON',
        placeholder: '{\n  "name": "Ana"\n}',
        accept: '.json,application/json,.txt',
        outExt: 'json',
        run: minifyJson
    },
    {
        slug: 'csv-to-json',
        title: 'CSV to JSON',
        seoTitle: 'Convert CSV to JSON Online, Nothing Uploaded',
        description: 'Turn a CSV file or pasted rows into JSON, using the first row as the keys. Free, and your data never leaves your device.',
        keywords: ['csv to json', 'convert csv to json', 'csv to json converter', 'csv to json online', ...noUpload],
        icon: IconTable,
        color: 'text-emerald-500',
        inputLabel: 'CSV',
        outputLabel: 'JSON',
        placeholder: 'name,age\nAna,31\nBen,28',
        accept: '.csv,text/csv,.txt',
        outExt: 'json',
        run: csvToJson
    },
    {
        slug: 'json-to-csv',
        title: 'JSON to CSV',
        seoTitle: 'Convert JSON to CSV Online, Nothing Uploaded',
        description: 'Turn a JSON list of objects into a CSV file that opens in Excel. Free, and your data never leaves your device.',
        keywords: ['json to csv', 'convert json to csv', 'json to csv converter', 'json to excel', ...noUpload],
        icon: IconTable,
        color: 'text-emerald-500',
        inputLabel: 'JSON',
        outputLabel: 'CSV',
        placeholder: '[{"name":"Ana","age":31},{"name":"Ben","age":28}]',
        accept: '.json,application/json,.txt',
        outExt: 'csv',
        run: jsonToCsv
    },
    {
        slug: 'srt-to-vtt',
        title: 'SRT to VTT',
        seoTitle: 'Convert SRT Subtitles to VTT Online, Nothing Uploaded',
        description: 'Convert SRT subtitle files to WebVTT for web video players. Free, and your file never leaves your device.',
        keywords: ['srt to vtt', 'convert srt to vtt', 'subtitle converter', 'srt to webvtt', ...noUpload],
        icon: IconFileText,
        color: 'text-violet-500',
        inputLabel: 'SRT subtitles',
        outputLabel: 'WebVTT',
        placeholder: '1\n00:00:01,000 --> 00:00:03,000\nHello',
        accept: '.srt,.txt',
        outExt: 'vtt',
        run: srtToVtt
    },
    {
        slug: 'vtt-to-srt',
        title: 'VTT to SRT',
        seoTitle: 'Convert VTT Subtitles to SRT Online, Nothing Uploaded',
        description: 'Convert WebVTT subtitle files to SRT for video editors and TVs. Free, and your file never leaves your device.',
        keywords: ['vtt to srt', 'convert vtt to srt', 'webvtt to srt', 'subtitle converter', ...noUpload],
        icon: IconFileText,
        color: 'text-violet-500',
        inputLabel: 'WebVTT subtitles',
        outputLabel: 'SRT',
        placeholder: 'WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello',
        accept: '.vtt,.txt',
        outExt: 'srt',
        run: vttToSrt
    },
    {
        slug: 'base64-encode',
        title: 'Base64 Encode',
        seoTitle: 'Base64 Encode Text Online, Nothing Uploaded',
        description: 'Encode text or a text file as Base64. Free, and your data never leaves your device.',
        keywords: ['base64 encode', 'encode base64', 'text to base64', 'base64 encoder', ...noUpload],
        icon: IconLock,
        color: 'text-slate-500',
        inputLabel: 'Text',
        outputLabel: 'Base64',
        placeholder: 'Hello, Orbit',
        accept: '.txt,text/plain',
        outExt: 'txt',
        run: base64Encode
    },
    {
        slug: 'base64-decode',
        title: 'Base64 Decode',
        seoTitle: 'Base64 Decode Online, Nothing Uploaded',
        description: 'Decode Base64 back to readable text. Free, and your data never leaves your device.',
        keywords: ['base64 decode', 'decode base64', 'base64 to text', 'base64 decoder', ...noUpload],
        icon: IconLock,
        color: 'text-slate-500',
        inputLabel: 'Base64',
        outputLabel: 'Text',
        placeholder: 'SGVsbG8sIE9yYml0',
        accept: '.txt,text/plain',
        outExt: 'txt',
        run: base64Decode
    }
];

export const getTextDef = (slug: string | undefined) => TEXT_DEFS.find((d) => d.slug === slug);
