import { tv, type VariantProps } from "tailwind-variants";
import { fieldText } from "$lib/control.js";

export const numberInput = tv({
	slots: {
		root: "relative flex w-full min-w-0 flex-col gap-1.5",
		label:
			"w-fit cursor-ew-resize select-none font-medium text-foreground text-sm data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
		group: [
			"flex w-full min-w-0 items-stretch overflow-hidden border border-input bg-(--field) hover:border-border-strong",
			"transition-[box-shadow,border-color] duration-[var(--duration-press)] ease-[var(--ease-ui-out)] motion-reduce:transition-none",
			"has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/20",
			"has-[input[aria-invalid=true]]:border-destructive has-[input[aria-invalid=true]]:ring-destructive/20 has-[input:disabled]:opacity-50",
			// A key press past min or max shakes the field, the same shake InputOTP uses.
			"data-[nudge=true]:animate-[otp-shake_240ms_ease-in-out] motion-reduce:animate-none",
		],
		input:
			"min-w-0 flex-1 bg-transparent text-center text-foreground tabular-nums outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
		button: [
			"flex shrink-0 cursor-pointer select-none items-center justify-center text-muted-foreground outline-none",
			"transition-colors duration-[var(--duration-press)] ease-[var(--ease-ui-out)] motion-reduce:transition-none",
			"hover:bg-foreground/[0.05] hover:text-foreground active:bg-foreground/[0.08]",
			"focus-visible:bg-foreground/[0.05] focus-visible:text-foreground",
			"disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
		],
		grip: "size-3 shrink-0 opacity-60",
		suffix: "flex shrink-0 items-center text-muted-foreground",
		prefix: "flex shrink-0 items-center ps-2.5 text-muted-foreground",
		hint: "pointer-events-none absolute top-full left-0 mt-1 whitespace-nowrap text-muted-foreground text-xs transition-opacity duration-(--duration-fast) data-[on=false]:opacity-0",
	},
	variants: {
		/** `scrub` folds the label into the field as its drag handle, with no steppers. */
		variant: {
			default: {},
			scrub: {
				root: "w-auto",
				group: "hover:border-border-strong",
				label: [
					"flex shrink-0 touch-none items-center gap-1 border-input border-e font-medium text-muted-foreground",
					"transition-colors duration-(--duration-fast) hover:bg-accent hover:text-accent-foreground",
					"data-[scrubbing]:bg-primary/10 data-[scrubbing]:text-primary motion-reduce:transition-none",
				],
				input: "text-left",
			},
		},
		size: {
			// Steppers are square: their width is the field height.
			xs: {
				group: "h-6 rounded-sm text-xs",
				button: "w-6 [&_svg]:size-3",
				input: fieldText({ size: "xs" }),
			},
			sm: {
				group: "h-8 rounded-md text-xs",
				button: "w-8 [&_svg]:size-3.5",
				input: fieldText({ size: "sm" }),
			},
			default: {
				group: "h-9 rounded-lg text-sm",
				button: "w-9 [&_svg]:size-3.5",
				input: fieldText({ size: "default" }),
			},
			lg: {
				group: "h-10 rounded-lg text-sm",
				button: "w-10 [&_svg]:size-4",
				input: fieldText({ size: "lg" }),
			},
			xl: {
				group: "h-12 rounded-xl text-base",
				button: "w-12 [&_svg]:size-4.5",
				input: fieldText({ size: "xl" }),
			},
		},
	},
	compoundVariants: [
		{
			variant: "scrub",
			size: "xs",
			class: {
				group: "w-24",
				label: "px-1.5 text-xs",
				input: "px-1.5",
				suffix: "pe-1.5",
			},
		},
		{
			variant: "scrub",
			size: "sm",
			class: { group: "w-28", label: "px-2 text-xs", input: "px-2", suffix: "pe-2" },
		},
		{
			variant: "scrub",
			size: "default",
			class: { group: "w-32", label: "px-2.5", input: "px-2.5", suffix: "pe-2.5" },
		},
		{
			variant: "scrub",
			size: "lg",
			class: { group: "w-36", label: "px-3", input: "px-3", suffix: "pe-3" },
		},
		{
			variant: "scrub",
			size: "xl",
			class: { group: "w-40", label: "px-4", input: "px-4", suffix: "pe-4" },
		},
	],
	defaultVariants: { variant: "default", size: "default" },
});

export type NumberInputVariant = NonNullable<VariantProps<typeof numberInput>["variant"]>;

export type NumberInputSize = NonNullable<VariantProps<typeof numberInput>["size"]>;
