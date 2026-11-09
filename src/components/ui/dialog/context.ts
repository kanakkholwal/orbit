import { createContext, type Snippet } from "svelte";
import type { DialogMotion, DialogSize, DialogVariant } from "./variants";

export type { DialogMotion, DialogSize, DialogVariant };

export type DialogContext = {
	readonly motion: DialogMotion;
	readonly size: DialogSize;
	readonly variant: DialogVariant;
	readonly dismissOnBackdrop: boolean;
	/** The footer hoists itself here so it can sit in the frame rim below the surface. */
	footer: { children?: Snippet; class?: string } | undefined;
};

export const [getDialog, setDialog] = createContext<DialogContext>();
