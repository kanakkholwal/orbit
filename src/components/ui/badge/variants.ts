import { tv, type VariantProps } from "tailwind-variants";

export const badge = tv({
	base: "inline-flex shrink-0 items-center gap-1.5 border font-medium whitespace-nowrap transition-colors duration-(--duration-fast)",
	variants: {
		variant: {
			// --primary on its own 15% tint is 4.01:1 in light; --primary-hover clears 4.5:1.
			default:
				"border-transparent bg-[color-mix(in_oklch,var(--primary)_15%,transparent)] text-primary-hover",
			secondary: "border-transparent bg-card text-foreground",
			outline: "border-border bg-transparent text-foreground",
			success:
				"border-transparent bg-[color-mix(in_oklch,var(--success)_15%,transparent)] text-success-strong",
			warning:
				"border-transparent bg-[color-mix(in_oklch,var(--warning)_15%,transparent)] text-warning-strong",
			destructive:
				"border-transparent bg-[color-mix(in_oklch,var(--destructive)_15%,transparent)] text-destructive-strong",
			info: "border-transparent bg-[color-mix(in_oklch,var(--info)_15%,transparent)] text-info-strong",
			// Premium marker: a warm gold tint with a sweeping shine (motion.css `badge-shine`).
			gold: "badge-shine border-[color-mix(in_oklch,var(--warning)_40%,transparent)] bg-[color-mix(in_oklch,var(--warning)_22%,transparent)] text-warning-strong",
		},
		size: {
			// Radius holds near 30% of the height, like the control ladder.
			sm: "h-5 gap-1 rounded-sm px-1.5 text-xs [&_svg]:size-3",
			default: "h-6 rounded-md px-2 text-xs [&_svg]:size-3",
			lg: "h-7 rounded-md px-2.5 text-sm [&_svg]:size-3.5",
			xl: "h-8 rounded-md px-3 text-sm [&_svg]:size-4",
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badge>["variant"]>;
export type BadgeSize = NonNullable<VariantProps<typeof badge>["size"]>;
