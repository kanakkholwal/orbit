import type { Component } from "svelte";
import type { BadgeVariant } from "$components/ui/badge/variants.js";

export type DocsNavIcon = Component<{
	size?: number;
	class?: string;
	"aria-hidden"?: boolean;
}>;

export interface DocsNavItem {
	href: string;
	label: string;
	/** Additional path prefixes that mark this link current. */
	match?: string[];
	/** Small pill after the label, e.g. a status like "beta". */
	badge?: string;
	/** Badge colour; the Badge default when omitted. */
	badgeVariant?: BadgeVariant;
}

export interface DocsNavSection {
	id: string;
	label: string;
	/** A direct section link. When omitted, the section discloses its items. */
	href?: string;
	/** Additional path prefixes that mark a direct section link current. */
	match?: string[];
	icon?: DocsNavIcon;
	/** Shown beside the section label, e.g. how many links it holds. */
	count?: number | string;
	items?: DocsNavItem[];
}
