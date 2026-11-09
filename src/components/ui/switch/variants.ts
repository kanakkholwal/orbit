import { tv, type VariantProps } from "tailwind-variants";

export const switchTrack = tv({
	base: [
		"group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-(--track) p-px",
		"transition-[background-color,box-shadow] duration-(--duration-slow) ease-[var(--ease-smooth)] motion-reduce:transition-none",
		"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"aria-checked:bg-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
		"not-aria-disabled:hover:bg-foreground/25 not-aria-disabled:aria-checked:hover:bg-primary-hover",
		"aria-invalid:border-destructive data-[invalid]:border-destructive",
	],
	variants: {
		/** `default`: a pill thumb; `round`: a circular thumb; `marked`: round, with on/off marks
		 * in the free half of the track, so state never rests on colour alone. */
		variant: {
			default: "",
			round: "",
			marked: [
				"before:pointer-events-none before:absolute before:top-1/2 before:left-1/4 before:h-[38%] before:w-0.5 before:-translate-1/2 before:rounded-full before:bg-primary-foreground",
				"after:pointer-events-none after:absolute after:top-1/2 after:right-1/4 after:aspect-square after:h-[38%] after:translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:border-[1.5px] after:border-muted-foreground",
				"before:opacity-0 after:opacity-100 aria-checked:before:opacity-100 aria-checked:after:opacity-0",
				"before:transition-opacity after:transition-opacity before:duration-(--duration-fast) after:duration-(--duration-fast) motion-reduce:before:transition-none motion-reduce:after:transition-none",
			],
		},
		size: {
			sm: "h-4 w-8",
			default: "h-5 w-10",
			lg: "h-6 w-12",
			xl: "h-7 w-14",
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

// The thumb stretches toward its travel while pressed, as iOS switches do, in every variant.
export const switchThumb = tv({
	base: [
		"switch-thumb relative z-1 rounded-full bg-background shadow-sm",
		"origin-left data-[state=checked]:origin-right group-active/switch:scale-x-[1.15] motion-reduce:group-active/switch:scale-x-100",
	],
	variants: {
		variant: { default: "", round: "", marked: "" },
		size: { sm: "", default: "", lg: "", xl: "" },
	},
	// Travel is the inner track width minus the thumb: 2px of border and 2px of padding go first.
	compoundVariants: [
		{
			variant: "default",
			size: "sm",
			class: "h-3 w-[17px] data-[state=checked]:translate-x-[11px]",
		},
		{
			variant: "default",
			size: "default",
			class: "h-4 w-[22px] data-[state=checked]:translate-x-3.5",
		},
		{
			variant: "default",
			size: "lg",
			class: "h-5 w-7 data-[state=checked]:translate-x-4",
		},
		{
			variant: "default",
			size: "xl",
			class: "h-6 w-8 data-[state=checked]:translate-x-5",
		},
		{
			variant: ["round", "marked"],
			size: "sm",
			class: "size-3 data-[state=checked]:translate-x-4",
		},
		{
			variant: ["round", "marked"],
			size: "default",
			class: "size-4 data-[state=checked]:translate-x-5",
		},
		{
			variant: ["round", "marked"],
			size: "lg",
			class: "size-5 data-[state=checked]:translate-x-6",
		},
		{
			variant: ["round", "marked"],
			size: "xl",
			class: "size-6 data-[state=checked]:translate-x-7",
		},
	],
	defaultVariants: { variant: "default", size: "default" },
});

export type SwitchVariant = NonNullable<VariantProps<typeof switchTrack>["variant"]>;
export type SwitchSize = NonNullable<VariantProps<typeof switchTrack>["size"]>;
