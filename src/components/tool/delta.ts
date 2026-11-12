export type DeltaTone = 'good' | 'bad' | 'flat';

/** Tone of a size change: smaller is good, larger or over the limit is bad. */
export function deltaTone(before: number, after: number, limit?: number): DeltaTone {
    if (limit && after > limit) return 'bad';
    const change = (after - before) / before;
    return change <= -0.01 ? 'good' : change >= 0.01 ? 'bad' : 'flat';
}
