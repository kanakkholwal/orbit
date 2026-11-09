import { getContext, setContext } from "svelte";
import type { TableDensity, TableVariant } from "./variants";

export type TableStyle = { variant: TableVariant; density: TableDensity };

const KEY = Symbol("table-style");

export function setTableStyle(style: () => TableStyle) {
	setContext(KEY, style);
}

export function getTableStyle(): () => TableStyle {
	const style = getContext<(() => TableStyle) | undefined>(KEY);
	return style ?? (() => ({ variant: "default", density: "comfortable" }));
}
