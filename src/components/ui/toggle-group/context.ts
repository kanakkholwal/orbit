import { createContext } from "svelte";
import type { ToggleGroupSize, ToggleGroupVariant } from "./variants";

export type { ToggleGroupSize, ToggleGroupVariant };

export type ToggleGroupContext = {
	readonly size: ToggleGroupSize;
	readonly variant: ToggleGroupVariant;
};

export const [getToggleGroup, setToggleGroup] = createContext<ToggleGroupContext>();
