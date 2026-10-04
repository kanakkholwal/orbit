import { createContext, type Snippet } from "svelte";
import type { DialogVariant } from "$components/ui/dialog/context.js";

export type AlertDialogContext = {
	readonly variant: DialogVariant;
	/** The footer hoists itself here so it can sit in the frame rim below the surface. */
	footer: { children?: Snippet; class?: string } | undefined;
};

export const [getAlertDialog, setAlertDialog] = createContext<AlertDialogContext>();
