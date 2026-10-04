import { createContext } from "svelte";
import type { TabsSize, TabsVariant } from "./variants";

export type { TabsSize, TabsVariant };

export type TabsContext = {
	readonly value: string;
	readonly variant: TabsVariant;
	readonly size: TabsSize;
};

export const [getTabs, setTabs] = createContext<TabsContext>();
