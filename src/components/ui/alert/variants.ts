import { tv, type VariantProps } from "tailwind-variants";

export const alert = tv({
	base: "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	variants: {
		variant: {
			info: "border-border bg-card text-foreground",
			success:
				"border-[color-mix(in_oklch,var(--success)_30%,transparent)] bg-[color-mix(in_oklch,var(--success)_10%,transparent)] text-foreground",
			warning:
				"border-[color-mix(in_oklch,var(--warning)_30%,transparent)] bg-[color-mix(in_oklch,var(--warning)_10%,transparent)] text-foreground",
			destructive:
				"border-[color-mix(in_oklch,var(--destructive)_30%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_10%,transparent)] text-foreground",
		},
	},
	defaultVariants: { variant: "info" },
});

export type AlertVariant = NonNullable<VariantProps<typeof alert>["variant"]>;

/** warning and destructive interrupt; info and success do not. */
export const ALERT_ROLE: Record<AlertVariant, "alert" | "status"> = {
	info: "status",
	success: "status",
	warning: "alert",
	destructive: "alert",
};

export const ALERT_ICON: Record<AlertVariant, string> = {
	info: "M8 7.2v4M8 5.1h.01",
	success: "M4.8 8.3 7 10.5l4.2-4.6",
	warning: "M8 5.6v3.2M8 11.1h.01",
	destructive: "M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8",
};
