import { tv, type VariantProps } from "tailwind-variants";

export const slider = tv({
	slots: {
		root: "group/slider relative flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-col data-[orientation=vertical]:h-full data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-center",
		// Vertical stacks the label over the value above the column instead of squeezing beside it.
		header:
			"mb-1 flex items-baseline justify-between gap-3 text-sm group-data-[orientation=vertical]/slider:mb-2 group-data-[orientation=vertical]/slider:flex-col group-data-[orientation=vertical]/slider:items-center group-data-[orientation=vertical]/slider:gap-0.5",
		title: "text-muted-foreground",
		value: "font-mono text-foreground text-xs tabular-nums",
		control:
			"relative flex touch-none select-none items-center data-[orientation=horizontal]:w-full data-[orientation=vertical]:min-h-0 data-[orientation=vertical]:flex-1 data-[orientation=vertical]:flex-col data-disabled:opacity-50",
		track:
			"relative overflow-hidden rounded-full bg-input transition-[height,width] duration-(--duration-press) ease-(--ease-out) data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full motion-reduce:transition-none",
		range:
			"slider-glide rounded-full bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
		thumb:
			"slider-glide block shrink-0 cursor-grab rounded-full border-primary bg-background shadow-sm outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)] active:cursor-grabbing active:scale-90 data-[active]:scale-90 data-[dragging]:scale-90",
		marks: "relative mt-2 h-4 w-full",
		mark: "absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1 text-muted-foreground text-xs tabular-nums",
		markDot: "size-1 rounded-full bg-muted-foreground/50",
		markButton:
			"rounded-sm outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		overlay: "pointer-events-none absolute inset-0 hidden",
		fillText: "hidden",
		inlineLabel: "hidden",
		inlineValue: "hidden",
		bubble: "hidden",
		bar: "hidden",
		ruler: "hidden",
		rulerReadout: "hidden",
		rulerWindow: "hidden",
		rulerStrip: "hidden",
		rulerTick: "absolute bottom-0 flex -translate-x-1/2 flex-col items-center pb-[18px]",
		rulerTickLine:
			"w-px rounded-full bg-foreground/45 data-major:h-7 data-major:bg-foreground/70 h-3.5",
		rulerTickLabel: "absolute bottom-0 text-muted-foreground text-xs tabular-nums",
		rulerNeedle: "hidden",
	},
	variants: {
		variant: {
			default: {},
			// An inset fill under a thin pill handle; vertical fills from the bottom with the pill laid flat.
			track: {
				control:
					"overflow-hidden rounded-lg bg-muted has-focus-visible:ring-4 has-focus-visible:ring-foreground/30 has-focus-visible:ring-inset",
				track: "absolute inset-0 size-full rounded-none bg-transparent",
				range: [
					"rounded-none bg-foreground/15 after:absolute after:bg-inherit",
					"group-data-[orientation=horizontal]/slider:rounded-l-lg group-data-[orientation=horizontal]/slider:after:inset-y-0 group-data-[orientation=horizontal]/slider:after:left-full group-data-[orientation=horizontal]/slider:after:w-1.5 group-data-[orientation=horizontal]/slider:after:rounded-r-lg",
					"group-data-[orientation=vertical]/slider:rounded-b-lg group-data-[orientation=vertical]/slider:after:inset-x-0 group-data-[orientation=vertical]/slider:after:bottom-full group-data-[orientation=vertical]/slider:after:h-1.5 group-data-[orientation=vertical]/slider:after:rounded-t-lg",
				],
				thumb: [
					"cursor-grab border-0 bg-transparent shadow-none hover:scale-100 focus-visible:shadow-none active:scale-100 data-[active]:scale-100 data-[dragging]:scale-100 active:cursor-grabbing",
					"group-data-[orientation=horizontal]/slider:h-full group-data-[orientation=horizontal]/slider:w-5 group-data-[orientation=vertical]/slider:h-5 group-data-[orientation=vertical]/slider:w-full",
					"before:absolute before:top-1/2 before:left-1/2 before:-translate-1/2 before:rounded-full before:bg-foreground",
					"group-data-[orientation=horizontal]/slider:before:h-6 group-data-[orientation=horizontal]/slider:before:w-1 group-data-[orientation=vertical]/slider:before:h-1 group-data-[orientation=vertical]/slider:before:w-6",
					"before:transition-[scale] before:duration-(--duration-press) before:ease-(--ease-out) motion-reduce:before:transition-none",
					"group-data-[orientation=horizontal]/slider:data-[active]:before:scale-y-[1.35] group-data-[orientation=horizontal]/slider:data-[dragging]:before:scale-y-[1.35] group-data-[orientation=vertical]/slider:data-[active]:before:scale-x-[1.35] group-data-[orientation=vertical]/slider:data-[dragging]:before:scale-x-[1.35]",
				],
			},
			// The track variant with its label and value inside; the handle parts around the text.
			inline: {
				control:
					"overflow-hidden rounded-lg bg-muted has-focus-visible:ring-4 has-focus-visible:ring-foreground/30 has-focus-visible:ring-inset",
				track: "absolute inset-0 h-full rounded-none bg-transparent",
				range:
					"rounded-none rounded-l-lg bg-foreground/15 after:absolute after:inset-y-0 after:left-full after:w-1.5 after:rounded-r-lg after:bg-inherit",
				overlay: "block text-foreground",
				inlineLabel:
					"absolute top-1/2 left-5 block max-w-[40%] -translate-y-1/2 truncate font-medium text-sm leading-5",
				inlineValue:
					"absolute top-1/2 right-5 block max-w-[40%] -translate-y-1/2 truncate font-semibold text-sm tabular-nums",
				thumb: [
					"h-full w-5 cursor-grab border-0 bg-transparent shadow-none hover:scale-100 focus-visible:shadow-none active:scale-100 data-[active]:scale-100 data-[dragging]:scale-100 active:cursor-grabbing",
					"before:absolute before:top-1/2 before:left-1/2 before:h-6 before:w-1 before:-translate-1/2 before:rounded-full before:bg-foreground before:opacity-[calc(1-var(--slider-split,0))]",
					"after:absolute after:top-1/2 after:left-1/2 after:h-[calc(1.5rem+var(--slider-split,0)*0.5rem)] after:w-1 after:-translate-1/2 after:[background:radial-gradient(circle_at_50%_2px,var(--foreground)_2px,transparent_2.5px),radial-gradient(circle_at_50%_calc(100%-2px),var(--foreground)_2px,transparent_2.5px)]",
					"before:transition-[opacity,scale] after:transition-[height] before:duration-(--duration-press) after:duration-(--duration-press) before:ease-(--ease-out) after:ease-(--ease-out) data-[active]:before:scale-y-[1.35] data-[dragging]:before:scale-y-[1.35] motion-reduce:before:transition-none motion-reduce:after:transition-none",
				],
			},
			// A value bubble pops out of the thumb while it is dragged: above it, or right of it when vertical.
			bubble: {
				root: "data-[orientation=horizontal]:pt-10 data-[orientation=vertical]:pr-16",
				thumb:
					"group/thumb size-5 border-2 border-foreground hover:scale-100 active:scale-125 data-[active]:scale-125 data-[dragging]:scale-125",
				range: "bg-foreground",
				track: "bg-muted",
				bubble: [
					"pointer-events-none absolute bottom-full left-1/2 mb-2.5 block origin-bottom -translate-x-1/2 whitespace-nowrap rounded-xl bg-foreground px-2.5 py-1 font-medium text-background text-sm tabular-nums shadow-md",
					"after:absolute after:top-full after:left-1/2 after:size-2.5 after:-translate-x-1/2 after:-translate-y-1.5 after:rotate-45 after:rounded-[3px] after:bg-foreground",
					"translate-y-2.5 scale-[0.4] opacity-0 transition-[opacity,scale,translate] duration-(--duration-exit) ease-(--ease-out)",
					"group-data-[active]/thumb:translate-y-0 group-data-[active]/thumb:scale-80 group-data-[active]/thumb:opacity-100 group-data-[active]/thumb:duration-(--duration-dropdown)",
					"group-data-[dragging]/thumb:translate-y-0 group-data-[dragging]/thumb:scale-80 group-data-[dragging]/thumb:opacity-100 group-data-[dragging]/thumb:duration-(--duration-dropdown)",
					"motion-reduce:translate-y-0 motion-reduce:scale-80 motion-reduce:transition-opacity",
					"group-data-[orientation=vertical]/slider:top-1/2 group-data-[orientation=vertical]/slider:bottom-auto group-data-[orientation=vertical]/slider:left-full group-data-[orientation=vertical]/slider:mb-0 group-data-[orientation=vertical]/slider:ml-2.5 group-data-[orientation=vertical]/slider:origin-left group-data-[orientation=vertical]/slider:-translate-x-2.5 group-data-[orientation=vertical]/slider:-translate-y-1/2",
					"group-data-[orientation=vertical]/slider:group-data-[active]/thumb:translate-x-0 group-data-[orientation=vertical]/slider:group-data-[active]/thumb:-translate-y-1/2 group-data-[orientation=vertical]/slider:group-data-[dragging]/thumb:translate-x-0 group-data-[orientation=vertical]/slider:group-data-[dragging]/thumb:-translate-y-1/2",
					"group-data-[orientation=vertical]/slider:motion-reduce:translate-x-0 group-data-[orientation=vertical]/slider:motion-reduce:-translate-y-1/2",
					"group-data-[orientation=vertical]/slider:after:top-1/2 group-data-[orientation=vertical]/slider:after:left-0 group-data-[orientation=vertical]/slider:after:-translate-y-1/2",
				],
			},
			// Thumbless: the whole pill is the control; a second copy of its text rides in the fill.
			fluid: {
				control:
					"@container overflow-hidden rounded-full bg-muted transition-[scale] duration-(--duration-press) ease-(--ease-out) has-focus-visible:ring-4 has-focus-visible:ring-foreground/40 has-focus-visible:ring-inset has-data-[active]:scale-[1.03] has-data-[dragging]:scale-[1.03] motion-reduce:transition-none",
				track: "absolute inset-0 h-full rounded-none bg-transparent",
				range: "overflow-hidden rounded-none rounded-r-full bg-foreground",
				thumb:
					"h-full w-0 border-0 opacity-0 shadow-none hover:scale-100 active:scale-100 data-[active]:scale-100 data-[dragging]:scale-100",
				overlay:
					"flex items-center justify-between gap-3 px-5 font-medium text-foreground text-sm",
				fillText:
					"pointer-events-none absolute inset-y-0 left-0 flex w-[100cqw] items-center justify-between gap-3 px-5 font-medium text-background text-sm",
				inlineLabel: "block truncate",
				inlineValue: "block shrink-0 tabular-nums",
			},
			// Equalizer bars crest around the value; bars up to it are filled.
			wave: {
				control:
					"h-20 cursor-grab rounded-xl has-focus-visible:ring-4 has-focus-visible:ring-foreground/30 active:cursor-grabbing",
				track: "absolute inset-0 h-full bg-transparent opacity-0",
				thumb:
					"h-full w-0 border-0 opacity-0 shadow-none hover:scale-100 active:scale-100 data-[active]:scale-100 data-[dragging]:scale-100",
				overlay: "flex items-center justify-between gap-1",
				bar: [
					"block h-14 flex-1 origin-center rounded-full bg-foreground/45 data-filled:bg-foreground",
					"scale-y-[var(--bar-scale)] transition-[scale,background-color] duration-300 ease-[linear(0,0.25,0.62,0.9,1.04,1.06,1.03,1,0.99,1)] motion-reduce:scale-y-40 motion-reduce:transition-none",
				],
			},
			// A scale scrolls under a fixed needle; drag the scale, not a handle.
			ruler: {
				root: "rounded-2xl has-focus-visible:ring-4 has-focus-visible:ring-foreground/30",
				control: "sr-only",
				ruler:
					"relative block w-full cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing",
				rulerReadout:
					"pointer-events-none flex items-baseline justify-center gap-1 pt-1 pb-3 font-semibold text-3xl text-foreground tabular-nums",
				rulerWindow:
					"relative block h-12 [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]",
				rulerStrip:
					"absolute inset-y-0 left-1/2 block data-[settling]:transition-transform data-[settling]:duration-500 data-[settling]:ease-[linear(0,0.25,0.62,0.9,1.04,1.06,1.03,1,0.99,1)] motion-reduce:data-[settling]:transition-none",
				rulerNeedle:
					"pointer-events-none absolute bottom-5 left-1/2 block h-9 w-[3px] -translate-x-1/2 rounded-full bg-foreground",
			},
		},
		size: {
			sm: {},
			md: {},
			lg: {},
		},
	},
	compoundVariants: [
		{
			variant: "default",
			size: "sm",
			class: {
				control: "data-[orientation=horizontal]:h-9 data-[orientation=vertical]:w-9",
				track:
					"data-[orientation=horizontal]:h-[3px] data-[orientation=vertical]:w-[3px] group-hover/slider:data-[orientation=horizontal]:h-[5px] group-hover/slider:data-[orientation=vertical]:w-[5px]",
				thumb: "size-3 border",
			},
		},
		{
			variant: "default",
			size: "md",
			class: {
				control: "data-[orientation=horizontal]:h-11 data-[orientation=vertical]:w-11",
				track:
					"data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1 group-hover/slider:data-[orientation=horizontal]:h-1.5 group-hover/slider:data-[orientation=vertical]:w-1.5",
			},
		},
		{ variant: "default", size: "md", class: { thumb: "size-4 border-2" } },
		{
			variant: "default",
			size: "lg",
			class: {
				control: "data-[orientation=horizontal]:h-14 data-[orientation=vertical]:w-14",
				track:
					"data-[orientation=horizontal]:h-[5px] data-[orientation=vertical]:w-[5px] group-hover/slider:data-[orientation=horizontal]:h-[7px] group-hover/slider:data-[orientation=vertical]:w-[7px]",
				thumb: "size-5 border-2",
			},
		},
		{
			variant: "bubble",
			size: "sm",
			class: {
				control: "data-[orientation=horizontal]:h-9 data-[orientation=vertical]:w-9",
				track: "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
			},
		},
		{
			variant: "bubble",
			size: "md",
			class: {
				control: "data-[orientation=horizontal]:h-11 data-[orientation=vertical]:w-11",
				track: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
			},
		},
		{
			variant: "bubble",
			size: "lg",
			class: {
				control: "data-[orientation=horizontal]:h-14 data-[orientation=vertical]:w-14",
				track: "data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5",
			},
		},
		{
			variant: "track",
			size: "sm",
			class: {
				control: "data-[orientation=horizontal]:h-8 data-[orientation=vertical]:w-8",
			},
		},
		{
			variant: "track",
			size: "md",
			class: {
				control: "data-[orientation=horizontal]:h-10 data-[orientation=vertical]:w-10",
			},
		},
		{
			variant: "track",
			size: "lg",
			class: {
				control: "data-[orientation=horizontal]:h-12 data-[orientation=vertical]:w-12",
			},
		},
		{ variant: "inline", size: "sm", class: { control: "h-8" } },
		{ variant: "inline", size: "md", class: { control: "h-10" } },
		{ variant: "inline", size: "lg", class: { control: "h-12" } },
		{ variant: "fluid", size: "sm", class: { control: "h-10" } },
		{ variant: "fluid", size: "md", class: { control: "h-12" } },
		{ variant: "fluid", size: "lg", class: { control: "h-14" } },
	],
	defaultVariants: { variant: "default", size: "md" },
});

export type SliderSize = NonNullable<VariantProps<typeof slider>["size"]>;
export type SliderVariant = NonNullable<VariantProps<typeof slider>["variant"]>;

export type SliderMark = { value: number; label?: string };

/** Share of the track `value` sits at, 0 to 100. */
export function sliderPercent(value: number, min: number, max: number): number {
	return max > min ? Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100)) : 0;
}
