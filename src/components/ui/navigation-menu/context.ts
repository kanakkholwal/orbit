import { getContext, setContext } from "svelte";
import type { NavigationMenuVariant } from "./variants";

const STYLE = Symbol("navigation-menu-style");

export const setNavigationMenuStyle = (variant: () => NavigationMenuVariant) =>
	setContext(STYLE, variant);

export const getNavigationMenuStyle = () =>
	getContext<() => NavigationMenuVariant>(STYLE) ?? (() => "default");
