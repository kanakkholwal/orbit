import { tv, type VariantProps } from "tailwind-variants";

// vaul and vaul-svelte both set data-vaul-drawer-direction, so side classes are written in full.

/** `framed` is a card-step rim around a popover-step inset surface; `default` is shadcn/ui's
 * flat vaul baseline on a single popover surface. */
export const drawerFrame = tv({
	slots: {
		overlay: "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]",
		// vaul eases with cubic-bezier(0.32, 0.72, 0, 1), our `--ease-drawer`; only the surface is ours.
		panel: [
			"group/drawer fixed z-50 flex flex-col text-foreground shadow-(--overlay-shadow) outline-none",
			"data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mx-auto data-[vaul-drawer-direction=bottom]:max-h-[92dvh] data-[vaul-drawer-direction=bottom]:w-full data-[vaul-drawer-direction=bottom]:max-w-2xl data-[vaul-drawer-direction=bottom]:rounded-t-3xl",
			"data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mx-auto data-[vaul-drawer-direction=top]:max-h-[92dvh] data-[vaul-drawer-direction=top]:w-full data-[vaul-drawer-direction=top]:max-w-2xl data-[vaul-drawer-direction=top]:rounded-b-3xl",
			"data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-80 data-[vaul-drawer-direction=left]:max-w-[85vw] data-[vaul-drawer-direction=left]:rounded-r-3xl",
			"data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-80 data-[vaul-drawer-direction=right]:max-w-[85vw] data-[vaul-drawer-direction=right]:rounded-l-3xl",
		],
		// vaul's own [data-vaul-handle] CSS is a 5px x 32px horizontal bar meant for bottom/top,
		// so left/right rotate it to a vertical bar pinned to the free edge.
		handle: [
			"shrink-0 cursor-grab! rounded-full! bg-muted-foreground/40! opacity-100! active:cursor-grabbing!",
			"group-data-[vaul-drawer-direction=bottom]/drawer:mx-auto! group-data-[vaul-drawer-direction=bottom]/drawer:mt-2 group-data-[vaul-drawer-direction=bottom]/drawer:mb-1 group-data-[vaul-drawer-direction=bottom]/drawer:h-1.5! group-data-[vaul-drawer-direction=bottom]/drawer:w-10!",
			"group-data-[vaul-drawer-direction=top]/drawer:order-last group-data-[vaul-drawer-direction=top]/drawer:mx-auto! group-data-[vaul-drawer-direction=top]/drawer:mt-1 group-data-[vaul-drawer-direction=top]/drawer:mb-2 group-data-[vaul-drawer-direction=top]/drawer:h-1.5! group-data-[vaul-drawer-direction=top]/drawer:w-10!",
			"group-data-[vaul-drawer-direction=left]/drawer:absolute! group-data-[vaul-drawer-direction=left]/drawer:top-1/2! group-data-[vaul-drawer-direction=left]/drawer:right-2! group-data-[vaul-drawer-direction=left]/drawer:-translate-y-1/2! group-data-[vaul-drawer-direction=left]/drawer:h-10! group-data-[vaul-drawer-direction=left]/drawer:w-1.5!",
			"group-data-[vaul-drawer-direction=right]/drawer:absolute! group-data-[vaul-drawer-direction=right]/drawer:top-1/2! group-data-[vaul-drawer-direction=right]/drawer:left-2! group-data-[vaul-drawer-direction=right]/drawer:-translate-y-1/2! group-data-[vaul-drawer-direction=right]/drawer:h-10! group-data-[vaul-drawer-direction=right]/drawer:w-1.5!",
		],
		// Not a separate drag target (vaul drags the whole panel), just the grab affordance.
		handleBar: [
			"hidden shrink-0 cursor-grab rounded-full bg-muted active:cursor-grabbing",
			"group-data-[vaul-drawer-direction=bottom]/drawer:mx-auto group-data-[vaul-drawer-direction=bottom]/drawer:mt-4 group-data-[vaul-drawer-direction=bottom]/drawer:block group-data-[vaul-drawer-direction=bottom]/drawer:h-2 group-data-[vaul-drawer-direction=bottom]/drawer:w-24",
			"group-data-[vaul-drawer-direction=top]/drawer:order-last group-data-[vaul-drawer-direction=top]/drawer:mx-auto group-data-[vaul-drawer-direction=top]/drawer:mb-4 group-data-[vaul-drawer-direction=top]/drawer:block group-data-[vaul-drawer-direction=top]/drawer:h-2 group-data-[vaul-drawer-direction=top]/drawer:w-24",
			"group-data-[vaul-drawer-direction=left]/drawer:absolute group-data-[vaul-drawer-direction=left]/drawer:top-1/2 group-data-[vaul-drawer-direction=left]/drawer:right-2 group-data-[vaul-drawer-direction=left]/drawer:-translate-y-1/2 group-data-[vaul-drawer-direction=left]/drawer:block group-data-[vaul-drawer-direction=left]/drawer:h-24 group-data-[vaul-drawer-direction=left]/drawer:w-2",
			"group-data-[vaul-drawer-direction=right]/drawer:absolute group-data-[vaul-drawer-direction=right]/drawer:top-1/2 group-data-[vaul-drawer-direction=right]/drawer:left-2 group-data-[vaul-drawer-direction=right]/drawer:-translate-y-1/2 group-data-[vaul-drawer-direction=right]/drawer:block group-data-[vaul-drawer-direction=right]/drawer:h-24 group-data-[vaul-drawer-direction=right]/drawer:w-2",
		],
		surface: "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
		// The icon-only close in the corner; a close with children styles itself.
		close:
			"absolute top-3 right-3 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
	},
	variants: {
		variant: {
			framed: {
				panel: "bg-card p-1",
				surface: [
					"rounded-[20px] border border-border bg-popover p-5",
					"group-data-[vaul-drawer-direction=bottom]/drawer:rounded-b-none group-data-[vaul-drawer-direction=top]/drawer:rounded-t-none",
					"group-data-[vaul-drawer-direction=left]/drawer:rounded-l-none group-data-[vaul-drawer-direction=right]/drawer:rounded-r-none",
				].join(" "),
			},
			default: {
				panel: "bg-popover",
				surface: "p-5",
			},
		},
	},
	defaultVariants: { variant: "default" },
});

export type DrawerVariant = NonNullable<VariantProps<typeof drawerFrame>["variant"]>;
