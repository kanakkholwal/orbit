import { createContext } from "svelte";

export type DrawerDirection = "top" | "bottom" | "left" | "right";

export type DrawerContext = {
	readonly direction: DrawerDirection;
};

export const [getDrawer, setDrawer] = createContext<DrawerContext>();
