import { createContext } from "svelte";
import type { SelectTriggerSize } from "./variants";

export const [getSelectSize, setSelectSize] = createContext<() => SelectTriggerSize>();
