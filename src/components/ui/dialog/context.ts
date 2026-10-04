import { createContext, type Snippet } from "svelte";
import type { DialogSize, DialogVariant } from "./variants";

export type { DialogSize, DialogVariant };

export type DialogContext = {
	readonly size: DialogSize;
	readonly variant: DialogVariant;
	readonly dismissOnBackdrop: boolean;
	/** The footer hoists itself here so it can sit in the frame rim below the surface. */
	footer: { children?: Snippet; class?: string } | undefined;
};

export const [getDialog, setDialog] = createContext<DialogContext>();
