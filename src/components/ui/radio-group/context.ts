import { createContext } from "svelte";
import type { RadioSize, RadioVariant } from "./variants";

export type { RadioSize, RadioVariant };

export type RadioGroupItemContext = {
	readonly size: RadioSize;
	readonly variant: RadioVariant;
};

export const [getRadioGroupItemContext, setRadioGroupItemContext] =
	createContext<RadioGroupItemContext>();
