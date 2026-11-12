/** Pure text transforms. Each throws an Error with a plain message the user can act on. */

export function formatJson(input: string, indent = 2): string {
    try {
        return JSON.stringify(JSON.parse(input), null, indent);
    } catch (err) {
        throw new Error(`This is not valid JSON. ${err instanceof Error ? err.message : ''}`.trim());
    }
}

export function minifyJson(input: string): string {
    return formatJson(input, 0);
}

function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    const src = text.replace(/^﻿/, '');
    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (quoted) {
            if (ch === '"' && src[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (ch === '"') quoted = false;
            else cell += ch;
        } else if (ch === '"') quoted = true;
        else if (ch === ',') {
            row.push(cell);
            cell = '';
        } else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && src[i + 1] === '\n') i++;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else cell += ch;
    }
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows.filter((r) => r.some((c) => c !== ''));
}

export function csvToJson(input: string): string {
    const rows = parseCsv(input);
    if (rows.length < 2) throw new Error('Add a header row and at least one data row.');
    const [head, ...body] = rows;
    const out = body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])));
    return JSON.stringify(out, null, 2);
}

const csvCell = (value: unknown) => {
    const text = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function jsonToCsv(input: string): string {
    let data: unknown;
    try {
        data = JSON.parse(input);
    } catch {
        throw new Error('This is not valid JSON.');
    }
    const list = Array.isArray(data) ? data : [data];
    if (list.length === 0 || list.some((r) => r === null || typeof r !== 'object' || Array.isArray(r))) {
        throw new Error('Use a list of objects, like [{"name": "Ana", "age": 31}].');
    }
    const headers = [...new Set(list.flatMap((r) => Object.keys(r as object)))];
    const lines = [headers.map(csvCell).join(',')];
    for (const r of list as Record<string, unknown>[]) lines.push(headers.map((h) => csvCell(r[h])).join(','));
    return lines.join('\n');
}

export function srtToVtt(input: string): string {
    const body = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
    if (!/-->/.test(body)) throw new Error('No subtitle timings found. SRT lines look like 00:00:01,000 --> 00:00:03,000.');
    return `WEBVTT\n\n${body.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')}\n`;
}

export function vttToSrt(input: string): string {
    const text = input.replace(/^﻿/, '').replace(/\r\n?/g, '\n').trim();
    if (!/-->/.test(text)) throw new Error('No subtitle timings found. VTT lines look like 00:00:01.000 --> 00:00:03.000.');
    const blocks = text
        .replace(/^WEBVTT[^\n]*\n+/, '')
        .split(/\n{2,}/)
        .filter((b) => /-->/.test(b) && !/^(NOTE|STYLE)/.test(b));
    return (
        blocks
            .map((block, i) => {
                const lines = block.split('\n');
                const at = lines.findIndex((l) => l.includes('-->'));
                const timing = lines[at]
                    .replace(/\s+(align|position|line|size):\S+/g, '')
                    .replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, '$1,$2')
                    .replace(/(^|\s)(\d{2}:\d{2})\.(\d{3})/g, '$100:$2,$3');
                return `${i + 1}\n${timing}\n${lines.slice(at + 1).join('\n')}`;
            })
            .join('\n\n') + '\n'
    );
}

export function base64Encode(input: string): string {
    const bytes = new TextEncoder().encode(input);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin);
}

export function base64Decode(input: string): string {
    try {
        const bin = atob(input.trim().replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, ''));
        return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    } catch {
        throw new Error('This is not valid Base64 text.');
    }
}
