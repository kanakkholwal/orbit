import { tv, type VariantProps } from "tailwind-variants";

// The frame is a size container, so the divider line can span any angle in container units.
export const imageCompare = tv({
	slots: {
		root: "group/compare relative isolate block w-full cursor-ew-resize touch-pan-y select-none overflow-clip rounded-xl bg-muted [-webkit-tap-highlight-color:transparent] [container-type:size] after:pointer-events-none after:absolute after:inset-0 after:z-[3] after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--foreground)_8%,transparent)] data-[orientation=vertical]:cursor-ns-resize data-[orientation=vertical]:touch-pan-x",
		layer:
			"absolute inset-0 [&_:is(img,picture,video)]:pointer-events-none [&_:is(img,picture,video)]:block [&_:is(img,picture,video)]:size-full [&_:is(img,picture,video)]:object-cover [&_img]:[-webkit-user-drag:none]",
		// Frosted, so captions read over any photo; they sit below the divider.
		chip: "pointer-events-none absolute top-3 left-3 z-[1] rounded-full bg-background/75 px-2.5 py-0.5 font-medium text-foreground text-xs backdrop-blur-md backdrop-saturate-150 data-[place=bottom]:top-auto data-[place=bottom]:bottom-3 data-[place=end]:right-3 data-[place=end]:left-auto",
		// A frame-sized layer moved by a share of itself: its top-left corner is the divider's centre.
		pivot: "pointer-events-none absolute inset-0 z-[2]",
		rotor: "absolute top-0 left-0 size-0",
		// The line sits on photography, not the theme, so it stays light in dark mode.
		line: "absolute -top-[calc(100cqw+100cqh)] -left-px h-[calc((100cqw+100cqh)*2)] w-0.5 bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.14)]",
		slot: "absolute top-0 left-0",
		handle:
			"pointer-events-auto absolute top-0 left-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-border bg-popover text-foreground shadow-overlay outline-none transition-[width,height,border-color] duration-(--duration-base) ease-[var(--ease-ui-out)] after:absolute after:-inset-2 after:rounded-[inherit] focus-visible:ring-2 focus-visible:ring-ring group-hover/compare:border-border-strong data-quiet:ring-0 motion-reduce:transition-none",
		chevrons: "flex items-center",
		chevron:
			"-mx-[2.5px] grid place-items-center transition-transform duration-(--duration-base) ease-[var(--ease-ui-out)] group-data-dragging/compare:first:-translate-x-1 group-data-dragging/compare:last:translate-x-1 motion-reduce:transition-none [&_svg]:size-4",
	},
	variants: {
		variant: {
			default: {},
			// A small ring on the line instead of the capsule; important beats the size and drag sizes.
			line: {
				handle:
					"size-4! border-2! border-white! bg-transparent! shadow-[0_0_0_1px_rgb(0_0_0/0.25)]! after:-inset-3",
				chevrons: "hidden",
			},
			overlay: {
				chip: "rounded-md bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm",
			},
		},
		size: {
			sm: {
				handle:
					"size-8 group-data-dragging/compare:h-7 group-data-dragging/compare:w-11 group-data-[orientation=vertical]/compare:group-data-dragging/compare:h-11 group-data-[orientation=vertical]/compare:group-data-dragging/compare:w-7",
			},
			default: {
				handle:
					"size-10 group-data-dragging/compare:h-9 group-data-dragging/compare:w-14 group-data-[orientation=vertical]/compare:group-data-dragging/compare:h-14 group-data-[orientation=vertical]/compare:group-data-dragging/compare:w-9",
			},
			lg: {
				handle:
					"size-12 group-data-dragging/compare:h-11 group-data-dragging/compare:w-16 group-data-[orientation=vertical]/compare:group-data-dragging/compare:h-16 group-data-[orientation=vertical]/compare:group-data-dragging/compare:w-11",
			},
		},
	},
	defaultVariants: { variant: "default", size: "default" },
});

export type ImageCompareVariant = NonNullable<
	VariantProps<typeof imageCompare>["variant"]
>;
export type ImageCompareSize = NonNullable<VariantProps<typeof imageCompare>["size"]>;
