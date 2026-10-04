import { tv, type VariantProps } from "tailwind-variants";

export const switchTrack = tv({
	base: [
		"group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent bg-input p-px",
		"transition-[background-color,box-shadow] duration-(--duration-slow) ease-[var(--ease-smooth)] motion-reduce:transition-none",
		"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"aria-checked:bg-primary aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
	],
	variants: {
		size: {
			sm: "h-4 w-8",
			md: "h-5 w-10",
			lg: "h-6 w-12",
			xl: "h-7 w-14",
		},
	},
	defaultVariants: { size: "md" },
});

// A pill thumb that stretches toward its travel while pressed, as iOS switches do.
export const switchThumb = tv({
	base: [
		"switch-thumb rounded-full bg-background shadow-sm",
		"origin-left data-[state=checked]:origin-right group-active/switch:scale-x-[1.15] motion-reduce:group-active/switch:scale-x-100",
	],
	variants: {
		size: {
			sm: "h-3 w-[17px] data-[state=checked]:translate-x-[11px]",
			md: "h-4 w-[22px] data-[state=checked]:translate-x-3.5",
			lg: "h-5 w-7 data-[state=checked]:translate-x-4",
			xl: "h-6 w-8 data-[state=checked]:translate-x-5",
		},
	},
	defaultVariants: { size: "md" },
});

export type SwitchSize = NonNullable<VariantProps<typeof switchTrack>["size"]>;
