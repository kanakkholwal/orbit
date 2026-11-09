import { createContext } from "svelte";
import type { TabsOrientation, TabsSize, TabsVariant } from "./variants";

export type { TabsOrientation, TabsSize, TabsVariant };

export type TabsContext = {
	readonly value: string;
	readonly variant: TabsVariant;
	readonly size: TabsSize;
	readonly orientation: TabsOrientation;
};

export const [getTabs, setTabs] = createContext<TabsContext>();
