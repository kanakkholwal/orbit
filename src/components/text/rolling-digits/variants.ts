import { tv, type VariantProps } from "tailwind-variants";

export const rollingDigits = tv({
	slots: {
		root: "inline-flex items-center tabular-nums",
		cells: "inline-flex items-center gap-0.5",
		cell: "inline-grid grid-cols-[1fr]",
		clip: "min-w-0 overflow-hidden",
		digit:
			"relative isolate grid min-h-[1em] min-w-[1ch] place-items-center overflow-hidden leading-none [&>*]:col-start-1 [&>*]:row-start-1",
		glyph: "[backface-visibility:hidden]",
		srOnly: "sr-only",
		// `odometer`: each digit is a 0 to 9 strip that slides to its row.
		odometerDigit: "relative inline-block h-[1lh] overflow-hidden align-bottom",
		odometerTrack: [
			"flex translate-y-[calc(var(--rd-index,0)*-1lh)] flex-col",
			"transition-[translate] duration-(--rd-duration) ease-(--ease-ui-out) motion-reduce:transition-none",
		],
		odometerRow: "h-[1lh] leading-[1lh]",
	},
	variants: {
		// `roll` springs each changed digit, `odometer` slides digit strips, `count` tweens the number.
		variant: { roll: {}, odometer: {}, count: {} },
		direction: {
			dynamic: {},
			up: {},
			down: {},
		},
		size: {
			inherit: {},
			sm: { root: "text-2xl" },
			default: { root: "text-4xl" },
			lg: { root: "text-6xl" },
		},
	},
	defaultVariants: { variant: "roll", direction: "dynamic", size: "inherit" },
});

export type RollingDigitsVariant = NonNullable<
	VariantProps<typeof rollingDigits>["variant"]
>;
export type RollingDigitsDirection = NonNullable<
	VariantProps<typeof rollingDigits>["direction"]
>;
export type RollingDigitsSize = NonNullable<VariantProps<typeof rollingDigits>["size"]>;
