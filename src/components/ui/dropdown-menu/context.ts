import { getContext, setContext } from "svelte";

const KEY = Symbol("dropdown-menu");

/** The trigger's id, so the menu is named by the button that opens it (aria-labelledby). */
export const setDropdownMenu = (triggerId: string) => setContext(KEY, triggerId);
export const dropdownMenuTrigger = (): string | undefined => getContext(KEY);
