import { getContext, setContext } from "svelte";
import type { ChangelogEntry, ChangelogKind } from "./changelog";
import type { changelogFeed } from "./variants";

/** What ChangelogFeed shares with its parts; read through getters so they stay reactive. */
export interface ChangelogFeedState {
	readonly entries: ChangelogEntry[];
	readonly locale?: string;
	readonly titleId: string;
	readonly kinds: ChangelogKind[];
	readonly open: string[];
	readonly shown: ChangelogEntry[];
	readonly styles: ReturnType<typeof changelogFeed>;
	setKinds(next: string | string[]): void;
	setOpen(next: string | string[]): void;
}

const KEY = Symbol("changelog-feed");

export const setChangelogFeed = (state: ChangelogFeedState) => setContext(KEY, state);
export function changelogFeedState(): ChangelogFeedState {
	const state = getContext<ChangelogFeedState | undefined>(KEY);
	if (!state)
		throw new Error("ChangelogFeed parts must be rendered inside a ChangelogFeed.");
	return state;
}
