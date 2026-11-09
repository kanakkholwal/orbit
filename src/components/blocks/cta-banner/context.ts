import { getContext, hasContext, setContext } from "svelte";
import { type CtaBannerSize, type CtaBannerVariant, ctaBanner } from "./variants";

type Banner = { variant: CtaBannerVariant; size: CtaBannerSize; titleId?: string };

const BANNER = Symbol("cta-banner");
export const setCtaBanner = (get: () => Banner) => setContext(BANNER, get);
/** The root's variant, size and title id, read lazily so a changed prop reaches every part. */
export const ctaBannerState = (): Banner =>
	hasContext(BANNER)
		? getContext<() => Banner>(BANNER)()
		: { variant: "grain", size: "default" };
export const ctaBannerStyles = () => ctaBanner(ctaBannerState());
