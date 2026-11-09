export type ChangelogKind = "new" | "improved" | "fixed";

export type ChangelogMedia =
	| { type: "photo"; src: string; alt: string; caption?: string }
	| { type: "code"; file: string; code: string; language?: string };

export interface ChangelogEntry {
	id: string;
	/** ISO date of the release. */
	date: string;
	version: string;
	kind: ChangelogKind;
	title: string;
	summary: string;
	details?: string[];
	media?: ChangelogMedia;
}

export const CHANGELOG_KINDS: { id: ChangelogKind; label: string }[] = [
	{ id: "new", label: "New" },
	{ id: "improved", label: "Improved" },
	{ id: "fixed", label: "Fixed" },
];

export const kindBadge = {
	new: "success",
	improved: "info",
	fixed: "warning",
} as const satisfies Record<ChangelogKind, string>;

const utc = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`);

/** Entries grouped by release month, newest first, keeping each month's label. */
export function changelogMonths(entries: ChangelogEntry[], locale?: string) {
	const label = new Intl.DateTimeFormat(locale, {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
	const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
	const months = new Map<
		string,
		{ key: string; label: string; items: ChangelogEntry[] }
	>();
	for (const entry of sorted) {
		const key = entry.date.slice(0, 7);
		const month = months.get(key) ?? {
			key,
			label: label.format(utc(entry.date)),
			items: [],
		};
		month.items.push(entry);
		months.set(key, month);
	}
	return [...months.values()];
}

export const changelogDay = (iso: string, locale?: string) =>
	new Intl.DateTimeFormat(locale, {
		month: "short",
		day: "numeric",
		timeZone: "UTC",
	}).format(utc(iso));

export const kindCount = (entries: ChangelogEntry[], kind: ChangelogKind) =>
	entries.filter((entry) => entry.kind === kind).length;

/** Whether an entry passes the kind filter; none selected shows every kind. */
export const kindShown = (entry: ChangelogEntry, kinds: ChangelogKind[]) =>
	kinds.length === 0 || kinds.includes(entry.kind);
