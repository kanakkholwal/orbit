import { getContext, setContext } from "svelte";

const KEY = Symbol("page-header");

/** Whether the sticky bar has condensed; read by PageHeaderBar. */
export type PageHeaderState = { readonly condensed: boolean };

export const setPageHeader = (state: PageHeaderState) => setContext(KEY, state);
export const pageHeaderState = (): PageHeaderState =>
	getContext<PageHeaderState>(KEY) ?? { condensed: false };
