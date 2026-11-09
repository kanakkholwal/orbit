import type { Component } from "svelte";
import type { SVGAttributes } from "svelte/elements";

export type IconProps = SVGAttributes<SVGSVGElement> & {
	/** Width and height; a number is pixels. */
	size?: number | string;
};

/** Any icon from this package, for props that take an icon component. */
export type Icon = Component<IconProps>;
