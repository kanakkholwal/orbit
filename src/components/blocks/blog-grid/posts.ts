export interface BlogAuthor {
	name: string;
	avatar?: string;
	role?: string;
}

export interface BlogPost {
	id: string;
	title: string;
	excerpt: string;
	category: string;
	/** ISO date; sorts the posts and reads as the visible date. */
	date: string;
	/** Minutes to read. */
	readTime: number;
	author: BlogAuthor;
	image?: { src: string; alt: string };
	/** Paragraphs for the in-place reader. */
	body?: string[];
	featured?: boolean;
}

export const ALL = "All";

/** What one page shows: the featured post on page one, then `pageSize` cards. */
export function blogPage(
	posts: BlogPost[],
	category: string,
	page: number,
	pageSize: number,
	showFeatured: boolean,
) {
	const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
	const filtered =
		category === ALL ? sorted : sorted.filter((p) => p.category === category);
	const featured =
		showFeatured && filtered.length > 1
			? (filtered.find((p) => p.featured) ?? filtered[0])
			: undefined;
	const rest = featured ? filtered.filter((p) => p !== featured) : filtered;
	const pageCount = Math.max(1, Math.ceil(rest.length / pageSize));
	const current = Math.min(Math.max(1, page), pageCount);
	return {
		filtered,
		featured: current === 1 ? featured : undefined,
		posts: rest.slice((current - 1) * pageSize, current * pageSize),
		pageCount,
		page: current,
	};
}

export function formatPostDate(iso: string, locale?: string) {
	return new Intl.DateTimeFormat(locale, {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${iso}T00:00:00Z`));
}

/** Eases `frame` from its height now to its content's next one; call before the content changes. */
export function easeHeight(frame: HTMLElement | null) {
	if (!frame || matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
	const from = frame.offsetHeight;
	frame.style.height = `${from}px`;
	return () => {
		const content = frame.firstElementChild;
		const to = content instanceof HTMLElement ? content.offsetHeight : from;
		if (to === from) {
			frame.style.height = "";
			return;
		}
		frame.getBoundingClientRect();
		frame.style.height = `${to}px`;
		const done = () => {
			frame.style.height = "";
			frame.removeEventListener("transitionend", done);
		};
		frame.addEventListener("transitionend", done);
	};
}

/** Runs `update` inside a view transition where supported, so a shared image morphs. */
export function withViewTransition(update: () => void | Promise<void>) {
	if (
		typeof document === "undefined" ||
		!("startViewTransition" in document) ||
		matchMedia("(prefers-reduced-motion: reduce)").matches
	) {
		void update();
		return;
	}
	document.startViewTransition(update);
}
