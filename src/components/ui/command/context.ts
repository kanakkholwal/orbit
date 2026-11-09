import { createContext, getContext, hasContext, type Snippet, setContext } from "svelte";
import type { CommandVariant, commandFrame } from "./variants";

export type CommandContext = {
	/** Visible rows after filtering, for the count next to the search input. */
	readonly resultCount: number;
	/** The currently highlighted item's value, so the sliding marker knows when to remeasure. */
	readonly activeValue: string;
	readonly variant: CommandVariant;
	readonly styles: ReturnType<typeof commandFrame>;
};

export const [getCommand, setCommand] = createContext<CommandContext>();

/** Bridges CommandDialog's variant/header to Command. Optional: standalone Command usage
 * outside a CommandDialog just skips it. */
export type CommandDialogState = {
	readonly open: boolean;
	readonly variant: CommandVariant;
	/** CommandHeader hoists here so CommandDialog can render it in the rim above the card. */
	header: { children?: Snippet; class?: string } | undefined;
};
// A plain key, not createContext: its tuple has no `has` member on some Svelte 5 releases.
const DIALOG_STATE = Symbol("command-dialog-state");
export const setCommandDialogState = (state: CommandDialogState) =>
	setContext(DIALOG_STATE, state);
/** Undefined outside a CommandDialog. */
export const getCommandDialogState = (): CommandDialogState | undefined =>
	hasContext(DIALOG_STATE) ? getContext<CommandDialogState>(DIALOG_STATE) : undefined;
