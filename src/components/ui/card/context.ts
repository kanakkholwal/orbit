import { getContext, type Snippet, setContext } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type CardWellFooter = {
	children?: Snippet;
	class?: string;
} & HTMLAttributes<HTMLDivElement>;

export type CardWellContext = {
	/** A well's footer hoists itself here so it renders in the rim below the body. */
	footer: CardWellFooter | undefined;
};

const KEY = Symbol("card-well");

// Optional, unlike createContext's getter: footers outside a well render in place.
export const getCardWell = () => getContext<CardWellContext | undefined>(KEY);
export const setCardWell = (context: CardWellContext) => setContext(KEY, context);
