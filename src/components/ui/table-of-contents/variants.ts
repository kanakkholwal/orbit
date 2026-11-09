import { tv, type VariantProps } from "tailwind-variants";

export const tableOfContents = tv({
	slots: {
		root: "relative flex flex-col",
		accent: "pointer-events-none absolute top-0 left-0",
		accentRail:
			"absolute transition-[clip-path] duration-(--duration-base) ease-[var(--ease-ui-out)] motion-reduce:transition-none",
		dot: "absolute top-0 left-0 size-1 rounded-full bg-primary [offset-distance:var(--offset-distance,0)] transition-[offset-distance] duration-(--duration-base) ease-[var(--ease-ui-out)] motion-reduce:transition-none",
		link: "relative scroll-m-4 py-1.5 text-muted-foreground text-sm transition-colors duration-(--duration-fast) [overflow-wrap:anywhere] hover:text-foreground aria-[current=location]:text-primary",
		rail: "absolute -top-1.5 left-0 -z-10 h-[calc(100%+0.375rem)]",
		railLine: "stroke-foreground/10",
		// The list overflows leftward from a fixed tick column, so unfolding labels never moves the page.
		minimap: "group/minimap relative z-10 ml-auto flex w-8 justify-end self-start",
		minimapList: [
			"relative isolate flex w-max shrink-0 flex-col py-1 pl-2",
			"before:absolute before:inset-y-0 before:-left-6 before:right-0 before:-z-1 before:bg-linear-to-l before:from-background before:from-60% before:to-transparent before:opacity-0 before:transition-opacity before:duration-(--duration-fast)",
			"group-focus-within/minimap:before:opacity-100 group-hover/minimap:before:opacity-100 motion-reduce:before:transition-none",
		],
		minimapLink:
			"group/tick flex h-6 items-center justify-between rounded-sm pr-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
		minimapLabel: [
			"mr-0 max-w-0 truncate text-[11px] text-muted-foreground/80 opacity-0",
			"transition-[max-width,margin,opacity,color] duration-(--duration-base) ease-(--ease-ui-out) motion-reduce:transition-none",
			"group-focus-within/minimap:mr-4 group-focus-within/minimap:max-w-56 group-focus-within/minimap:opacity-100 group-hover/minimap:mr-4 group-hover/minimap:max-w-56 group-hover/minimap:opacity-100",
			"group-data-[depth=3]/tick:group-focus-within/minimap:pl-3 group-data-[depth=3]/tick:group-hover/minimap:pl-3",
			"group-hover/tick:text-foreground group-focus-visible/tick:text-foreground group-data-[active]/tick:font-medium group-data-[active]/tick:text-foreground group-data-[active]/tick:text-xs",
		],
		minimapTick: [
			"h-0.5 w-3 shrink-0 rounded-full bg-foreground/20 transition-[width,background-color] duration-(--duration-fast) ease-(--ease-ui-out) motion-reduce:transition-none",
			"group-data-[depth=3]/tick:w-2 group-hover/tick:w-5 group-hover/tick:bg-foreground/70 group-focus-visible/tick:w-5 group-focus-visible/tick:bg-ring group-data-[active]/tick:w-5 group-data-[active]/tick:bg-primary",
		],
	},
	variants: {
		variant: {
			curve: {},
			straight: {},
			minimap: {},
		},
		indicator: {
			true: {},
			false: { dot: "hidden" },
		},
	},
	defaultVariants: { variant: "curve", indicator: true },
});

export type TableOfContentsVariant = NonNullable<
	VariantProps<typeof tableOfContents>["variant"]
>;
