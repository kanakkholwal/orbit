export type DiffKind = 'same' | 'added' | 'removed';

export interface Token {
    text: string;
    /** True for a line break marker, rendered as a break rather than a word. */
    br: boolean;
}

export interface DiffPart {
    kind: DiffKind;
    tokens: Token[];
    /** Index of the change this part belongs to, or -1 for unchanged text. */
    change: number;
}

export interface PageDiff {
    parts: DiffPart[];
    changes: number;
    /** True when the pages were too different to line up word by word. */
    rough: boolean;
}

const MAX_EDITS = 2500;

/** Splits page text into words and line breaks. */
export function tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    const lines = text.split('\n');
    lines.forEach((line, i) => {
        for (const word of line.split(/\s+/)) if (word) tokens.push({ text: word, br: false });
        if (i < lines.length - 1 && tokens.length > 0 && !tokens[tokens.length - 1].br) {
            tokens.push({ text: '\n', br: true });
        }
    });
    while (tokens.length > 0 && tokens[tokens.length - 1].br) tokens.pop();
    return tokens;
}

type Op = 'same' | 'added' | 'removed';

/** Myers O(ND) diff over two key arrays. Returns null when more than `maxEdits` edits are needed. */
export function myers(a: string[], b: string[], maxEdits = MAX_EDITS): Op[] | null {
    let start = 0;
    while (start < a.length && start < b.length && a[start] === b[start]) start++;
    let endA = a.length;
    let endB = b.length;
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
        endA--;
        endB--;
    }

    const n = endA - start;
    const m = endB - start;
    const head: Op[] = new Array(start).fill('same');
    const tail: Op[] = new Array(a.length - endA).fill('same');
    if (n === 0 || m === 0) {
        return [...head, ...new Array(n).fill('removed'), ...new Array(m).fill('added'), ...tail];
    }

    const max = Math.min(n + m, maxEdits);
    const offset = max + 1;
    const v = new Int32Array(2 * max + 3);
    const trace: Int32Array[] = [];
    let found = -1;

    for (let d = 0; d <= max && found < 0; d++) {
        const snapshot = new Int32Array(2 * d + 1);
        for (let k = -d; k <= d; k += 2) {
            let x =
                k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])
                    ? v[offset + k + 1]
                    : v[offset + k - 1] + 1;
            let y = x - k;
            while (x < n && y < m && a[start + x] === b[start + y]) {
                x++;
                y++;
            }
            v[offset + k] = x;
            if (x >= n && y >= m) found = d;
        }
        for (let k = -d; k <= d; k++) snapshot[k + d] = v[offset + k];
        trace.push(snapshot);
    }
    if (found < 0) return null;

    const ops: Op[] = [];
    let x = n;
    let y = m;
    for (let d = found; d > 0; d--) {
        const prev = trace[d - 1];
        const k = x - y;
        const at = (kk: number) => prev[kk + d - 1];
        const down = k === -d || (k !== d && at(k - 1) < at(k + 1));
        const prevK = down ? k + 1 : k - 1;
        const prevX = at(prevK);
        const prevY = prevX - prevK;
        while (x > prevX && y > prevY) {
            ops.push('same');
            x--;
            y--;
        }
        ops.push(down ? 'added' : 'removed');
        if (down) y--;
        else x--;
    }
    while (x > 0 && y > 0) {
        ops.push('same');
        x--;
        y--;
    }
    ops.reverse();
    return [...head, ...ops, ...tail];
}

const keyOf = (token: Token, loose: boolean) => (loose ? token.text.toLowerCase() : token.text);

/** Word-level diff of two pages. `loose` ignores line breaks and capital letters. */
export function diffPages(before: Token[], after: Token[], loose: boolean): PageDiff {
    const a = loose ? before.filter((t) => !t.br) : before;
    const b = loose ? after.filter((t) => !t.br) : after;
    const ops = myers(
        a.map((t) => keyOf(t, loose)),
        b.map((t) => keyOf(t, loose))
    );

    const parts: DiffPart[] = [];
    let changes = 0;
    const push = (kind: DiffKind, token: Token) => {
        const last = parts[parts.length - 1];
        if (last && last.kind === kind) {
            last.tokens.push(token);
            return;
        }
        const extendsChange = kind !== 'same' && last && last.kind !== 'same';
        if (kind !== 'same' && !extendsChange) changes++;
        parts.push({ kind, tokens: [token], change: kind === 'same' ? -1 : changes - 1 });
    };

    if (!ops) {
        for (const t of a) push('removed', t);
        for (const t of b) push('added', t);
        return { parts: withBreaks(parts, after, loose), changes, rough: true };
    }

    let i = 0;
    let j = 0;
    for (const op of ops) {
        if (op === 'same') {
            push('same', b[j]);
            i++;
            j++;
        } else if (op === 'removed') push('removed', a[i++]);
        else push('added', b[j++]);
    }
    return { parts: withBreaks(parts, after, loose), changes, rough: false };
}

function withBreaks(parts: DiffPart[], after: Token[], loose: boolean): DiffPart[] {
    if (!loose) return parts;
    const breaks = new Set<Token>();
    after.forEach((t, i) => {
        if (t.br && i > 0) breaks.add(after[i - 1]);
    });
    for (const part of parts) {
        if (part.kind === 'removed') continue;
        part.tokens = part.tokens.flatMap((t) => (breaks.has(t) ? [t, { text: '\n', br: true }] : [t]));
    }
    return parts;
}

/** Pairs pages of two documents: identical pages anchor the match, the rest pair up in order. */
export function alignPages(before: string[], after: string[]): [number, number][] {
    const n = before.length;
    const m = after.length;
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
    const a = before.map(norm);
    const b = after.map(norm);

    const anchors: [number, number][] = [];
    if (n * m <= 4_000_000) {
        const table = new Uint32Array((n + 1) * (m + 1));
        const w = m + 1;
        for (let i = n - 1; i >= 0; i--) {
            for (let j = m - 1; j >= 0; j--) {
                table[i * w + j] =
                    a[i] === b[j] && a[i] !== ''
                        ? table[(i + 1) * w + j + 1] + 1
                        : Math.max(table[(i + 1) * w + j], table[i * w + j + 1]);
            }
        }
        let i = 0;
        let j = 0;
        while (i < n && j < m) {
            if (a[i] === b[j] && a[i] !== '') {
                anchors.push([i, j]);
                i++;
                j++;
            } else if (table[(i + 1) * w + j] >= table[i * w + j + 1]) i++;
            else j++;
        }
    }

    const pairs: [number, number][] = [];
    let i = 0;
    let j = 0;
    for (const [ai, bj] of [...anchors, [n, m] as [number, number]]) {
        while (i < ai && j < bj) pairs.push([i++, j++]);
        while (i < ai) pairs.push([i++, -1]);
        while (j < bj) pairs.push([-1, j++]);
        if (ai < n) pairs.push([i++, j++]);
    }
    return pairs;
}
