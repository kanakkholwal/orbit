import { tv, type VariantProps } from "tailwind-variants";

export const accordion = tv({
	base: [
		"group/accordion divide-y divide-border overflow-hidden rounded-xl border border-border",
		"[--accordion-duration:var(--duration-collapse)] [--accordion-ease:var(--ease-out-quad)]",
		"[--accordion-open-duration:var(--duration-collapse)] [--accordion-open-ease:var(--ease-out-quad)]",
		"[--accordion-content-y:-0.25rem] [--accordion-content-scale:1]",
	],
	variants: {
		motion: {
			smooth: "",
			bouncy:
				"[--accordion-duration:var(--duration-spring-snappy)] [--accordion-ease:var(--ease-spring-snappy)] [--accordion-open-duration:var(--duration-spring-bouncy)] [--accordion-open-ease:var(--ease-spring-bouncy)] [--accordion-content-y:-0.5rem] [--accordion-content-scale:0.95]",
			fade: "[--accordion-duration:var(--duration-dropdown)] [--accordion-ease:var(--ease-ui-out)] [--accordion-open-duration:var(--duration-dropdown)] [--accordion-open-ease:var(--ease-ui-out)] [--accordion-content-y:0rem]",
		},
	},
	defaultVariants: { motion: "smooth" },
});

export type AccordionMotion = NonNullable<VariantProps<typeof accordion>["motion"]>;
