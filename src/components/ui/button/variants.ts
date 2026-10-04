import { tv, type VariantProps } from "tailwind-variants";

export const button = tv({
	base: [
		"relative inline-flex shrink-0 select-none items-center justify-center gap-2",
		"whitespace-nowrap rounded-lg border border-transparent font-medium text-sm",
		// Colour answers at once; the squish settles slower so it reads soft, not twitchy.
		"transition-[transform,scale,translate,background-color,border-color,color,box-shadow]",
		"[transition-duration:var(--duration-slow),var(--duration-slow),var(--duration-slow),var(--duration-instant),var(--duration-instant),var(--duration-instant),var(--duration-instant)] ease-[var(--ease-smooth)]",
		"active:scale-[var(--press-scale)]",
		"outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
		"disabled:pointer-events-none disabled:opacity-50",
		"aria-busy:cursor-progress",
		"[&_svg]:pointer-events-none [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			// Hover darkens toward --foreground: white on a lightened blue fell to 4.05:1.
			default: "bg-primary text-primary-foreground hover:bg-(--primary-hover)",
			default_soft: "border-primary/10 bg-primary/8 text-primary hover:bg-primary/15",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			outline:
				"border-input bg-background hover:bg-foreground/[0.06] hover:text-foreground",
			ghost: "hover:bg-foreground/[0.06] hover:text-foreground",
			link: "text-primary underline-offset-4 hover:underline active:scale-100",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			destructive_soft:
				"border-destructive/10 bg-destructive/10 text-destructive-strong hover:bg-destructive/15",
			success: "bg-success text-success-foreground hover:bg-success/90",
			success_soft:
				"border-success/10 bg-success/10 text-success-strong hover:bg-success/15",
			warning: "bg-warning text-warning-foreground hover:bg-warning/90",
			warning_soft:
				"border-warning/10 bg-warning/10 text-warning-strong hover:bg-warning/15",
			info: "bg-info text-info-foreground hover:bg-info/90",
			info_soft: "border-info/10 bg-info/10 text-info-strong hover:bg-info/15",
			// Raised surfaces: each tone sets --surface; the shared recipe below mixes the sheen,
			// edges, ring and shadow from it, so they follow the theme's accent.
			default_surface: "text-primary-foreground [--surface:var(--primary)]",
			secondary_surface: [
				"text-foreground",
				"[background:linear-gradient(var(--background),color-mix(in_oklab,var(--background)_94%,var(--foreground)))_padding-box,linear-gradient(color-mix(in_oklab,var(--foreground)_5%,var(--background)),color-mix(in_oklab,var(--foreground)_14%,var(--background)))_border-box]",
				"shadow-[0_0_0_1px_color-mix(in_oklab,var(--foreground)_7%,transparent),inset_0_-3px_6px_-3px_color-mix(in_oklab,var(--foreground)_8%,transparent),0_1px_2px_0_rgb(0_0_0/0.06),0_2px_4px_0_rgb(0_0_0/0.04)]",
				"hover:brightness-[0.98] dark:hover:brightness-110",
			],
			destructive_surface: "text-destructive-foreground [--surface:var(--destructive)]",
			success_surface: "text-success-foreground [--surface:var(--success)]",
			warning_surface: "text-warning-foreground [--surface:var(--warning)]",
			info_surface: "text-info-foreground [--surface:var(--info)]",
			dark: "bg-foreground text-background hover:bg-foreground/90",
			light: "bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white",
			raw: "h-auto rounded-none border-0 p-0 active:scale-100",
		},
		size: {
			xs: "h-6 gap-1.5 rounded-md px-2 text-xs active:scale-[var(--press-scale-sm)] [&_svg]:size-3",
			sm: "h-8 gap-1.5 px-3 text-xs active:scale-[var(--press-scale-sm)] [&_svg]:size-3.5",
			md: "h-9 px-4 [&_svg]:size-4",
			lg: "h-10 px-5 active:scale-[var(--press-scale-lg)] [&_svg]:size-4",
			xl: "h-12 px-7 text-base active:scale-[var(--press-scale-lg)] [&_svg]:size-5",
			"icon-xs":
				"size-6 rounded-md p-0 active:scale-[var(--press-scale-icon)] [&_svg]:size-3",
			"icon-sm": "size-8 p-0 active:scale-[var(--press-scale-icon)] [&_svg]:size-3.5",
			icon: "size-9 p-0 [&_svg]:size-4",
			"icon-lg": "size-10 p-0 active:scale-[var(--press-scale-lg)] [&_svg]:size-4",
			"icon-xl": "size-12 p-0 active:scale-[var(--press-scale-lg)] [&_svg]:size-5",
		},
	},
	compoundVariants: [
		{
			// Stops derive from --surface: fill falls ~10% darker, edge runs lit to deep, the inset
			// shade and drops are tinted alphas. Hover lifts brightness, since gradients can't transition.
			variant: [
				"default_surface",
				"destructive_surface",
				"success_surface",
				"warning_surface",
				"info_surface",
			],
			class: [
				"[background:linear-gradient(rgb(255_255_255/0.12),transparent_50%)_padding-box,linear-gradient(var(--surface),color-mix(in_oklab,var(--surface)_90%,black))_padding-box,linear-gradient(color-mix(in_oklab,var(--surface)_70%,white),color-mix(in_oklab,var(--surface)_80%,black))_border-box]",
				"shadow-[0_0_0_1px_color-mix(in_oklab,var(--surface)_74%,black),inset_0_-3px_6px_-3px_color-mix(in_oklab,color-mix(in_oklab,var(--surface)_30%,black)_18%,transparent),0_1px_1px_0_color-mix(in_oklab,color-mix(in_oklab,var(--surface)_55%,black)_12%,transparent),0_2px_4px_0_color-mix(in_oklab,color-mix(in_oklab,var(--surface)_55%,black)_16%,transparent)]",
				"hover:brightness-[1.06]",
			],
		},
		{
			variant: [
				"default_surface",
				"secondary_surface",
				"destructive_surface",
				"success_surface",
				"warning_surface",
				"info_surface",
			],
			class:
				"transition-[transform,scale,translate,background-color,border-color,color,box-shadow,filter]",
		},
	],
	defaultVariants: { variant: "default", size: "md" },
});

export type ButtonVariant = NonNullable<VariantProps<typeof button>["variant"]>;
export type ButtonSize = NonNullable<VariantProps<typeof button>["size"]>;

/** Square sizes show the spinner alone while loading; the label goes to assistive tech. */
export function isIconSize(size: ButtonSize | undefined): boolean {
	return size?.startsWith("icon") ?? false;
}
