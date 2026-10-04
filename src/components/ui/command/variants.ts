import { tv, type VariantProps } from "tailwind-variants";

export const commandFrame = tv({
	slots: {
		// Opened from the keyboard many times a day, so it appears at once; only closing fades.
		popup: [
			"fixed top-[14vh] left-1/2 z-50 -translate-x-1/2 outline-none transition-opacity duration-0",
			"data-[closed]:opacity-0 data-[closed]:duration-[var(--duration-exit)] data-[closed]:ease-[var(--ease-out)]",
			"data-[state=closed]:opacity-0 data-[state=closed]:duration-[var(--duration-exit)] data-[state=closed]:ease-[var(--ease-out)]",
			"flex max-h-[min(30rem,70dvh)] w-[min(36rem,calc(100vw-2rem))] flex-col overflow-hidden",
			"motion-reduce:transition-none",
		],
		panel: "",
		body: "relative flex min-h-0 flex-col overflow-hidden text-foreground",
		// The framed rim: a title and the Escape hint above the card.
		header: "flex items-center justify-between gap-3 px-3.5",
		bar: "flex shrink-0 items-center gap-2",
		inputWrap: "flex shrink-0 items-center gap-2",
		inputIcon: "size-4 shrink-0 text-muted-foreground",
		input:
			"w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
		count: "hidden",
		// Caps in a hint depress while their key is held, so the footer answers the keyboard.
		kbd: "inline-flex h-5 min-w-5 shrink-0 items-center justify-center gap-0.5 rounded-md bg-foreground/[0.06] px-1.5 font-medium font-sans text-muted-foreground text-xs transition-[translate,background-color,color] duration-(--duration-instant) ease-[var(--ease-out)] data-[pressed]:translate-y-px data-[pressed]:bg-foreground/[0.08] data-[pressed]:text-foreground motion-reduce:transition-none",
		// ToggleGroup brings a rim and a pressed fill; the sliding pill replaces both.
		filters: "relative flex shrink-0 items-center border-0 bg-transparent p-0",
		pill: "pointer-events-none absolute top-0 left-0 data-[ready]:transition-[translate,width,height] data-[ready]:duration-(--duration-slow) data-[ready]:ease-[var(--ease-out)] motion-reduce:transition-none",
		filter: [
			"relative z-10 inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 font-medium text-muted-foreground outline-none data-[pressed]:bg-transparent data-[state=on]:bg-transparent",
			"transition-[color,background-color] duration-(--duration-fast) ease-[var(--ease-out)] hover:text-foreground",
			"focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [&_svg]:size-4 [&_svg]:shrink-0",
		],
		list: "scroll-area relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain",
		// cmdk renders the heading itself, so React styles it through the group; Svelte uses groupHeading.
		group:
			"[&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:text-xs",
		groupHeading: "font-medium text-muted-foreground text-xs",
		groupItems: "",
		// cmdk writes data-selected="true"/"false"; bits-ui writes a bare attribute.
		item: [
			"relative flex w-full cursor-default select-none items-center gap-2 text-left text-sm outline-none",
			"[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
			'data-[disabled=""]:pointer-events-none data-[disabled=""]:opacity-50 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
		],
		// One marker for the active row. It snaps: arrow keys repeat too fast for motion to help.
		marker:
			"pointer-events-none absolute top-0 left-0 data-[glide]:transition-[translate,width,height] data-[glide]:duration-(--duration-fast) data-[glide]:ease-[var(--ease-out)] motion-reduce:transition-none",
		empty: "text-center text-muted-foreground text-sm",
		shortcut: "ml-auto shrink-0 text-muted-foreground text-xs tracking-widest",
		separator: "-mx-1 h-px border-0 bg-border",
		footer:
			"flex shrink-0 items-center justify-between gap-4 text-muted-foreground text-xs",
		hint: "flex items-center gap-1.5",
	},
	variants: {
		/**
		 * `default` is plain shadcn. `framed` adds a titled rim around an inset card. `launcher`
		 * pairs a pill search with an icon filter tray and key hints. `spotlight` is a large input under scope chips.
		 */
		variant: {
			default: {
				panel: "rounded-xl bg-popover shadow-(--overlay-shadow)",
				body: "rounded-xl bg-popover p-1",
				inputWrap: "mx-1 mt-1 h-8 rounded-lg border border-input/30 bg-input/30 px-2",
				inputIcon: "opacity-50",
				input: "h-8 text-sm",
				list: "max-h-72 scroll-py-1",
				group: "p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
				groupHeading: "px-2 py-1.5",
				item: [
					"rounded-sm px-2 py-1.5",
					'data-[selected=""]:bg-foreground/[0.06] data-[selected=""]:[&_svg]:text-foreground data-[selected=true]:bg-foreground/[0.06] data-[selected=true]:[&_svg]:text-foreground',
				],
				marker: "hidden",
				empty: "py-6",
				footer: "border-border border-t px-3 py-2",
			},
			framed: {
				panel: "rounded-2xl bg-card p-1 shadow-(--overlay-shadow)",
				header: "pt-1.5 pb-2",
				body: "rounded-[11px] border border-border bg-popover",
				inputWrap: "border-border border-b px-3",
				input: "h-12 text-sm",
				count:
					"block min-w-[2ch] shrink-0 text-right font-mono text-muted-foreground text-xs tabular-nums",
				list: "py-1.5",
				groupHeading: "px-4 pt-2 pb-1 font-semibold text-xs uppercase tracking-wide",
				group:
					"[&_[cmdk-group-heading]]:px-4 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-items]]:px-1.5",
				groupItems: "px-1.5",
				item: [
					"justify-between gap-3 rounded-lg px-2.5 py-2 text-muted-foreground",
					"transition-[color,scale] [transition-duration:var(--duration-instant),var(--duration-slow)] ease-[var(--ease-out-quart)] active:scale-[var(--press-scale-row)] motion-reduce:transition-none",
					'data-[selected=""]:text-foreground data-[selected=true]:text-foreground',
				],
				marker: "rounded-md bg-foreground/[0.06]",
				empty: "px-4 py-10",
				footer: "border-border border-t px-4 py-2",
			},
			launcher: {
				popup: "w-[min(42rem,calc(100vw-2rem))]",
				// The popover is the lifted frame; input, tray and list recess into the page colour.
				panel: "rounded-3xl bg-popover p-3 shadow-(--overlay-shadow)",
				body: "gap-3",
				bar: "flex-wrap sm:flex-nowrap",
				inputWrap:
					"h-11 min-w-48 flex-1 rounded-full border border-border bg-background px-4",
				input: "h-11 text-sm",
				filters: "gap-0.5 rounded-full border border-border bg-background p-1",
				pill: "rounded-full bg-foreground/[0.06]",
				filter:
					"size-9 rounded-full data-[pressed]:text-foreground data-[state=on]:text-foreground",
				list: "rounded-2xl border border-border bg-background p-1.5",
				// Hints read as plain text on the frame; a held key still darkens.
				kbd: "h-auto min-w-0 bg-transparent px-0",
				group:
					"[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5",
				groupHeading: "px-2.5 pt-2 pb-1.5",
				item: [
					"gap-3 rounded-xl px-2.5 py-2.5 text-muted-foreground text-sm",
					"transition-[color,scale] [transition-duration:var(--duration-instant),var(--duration-fast)] ease-[var(--ease-out)] active:scale-[0.99] motion-reduce:transition-none",
					'data-[selected=""]:text-foreground data-[selected=true]:text-foreground',
				],
				marker: "rounded-xl bg-foreground/[0.06]",
				empty: "py-10",
				footer: "px-2 pt-0.5",
			},
			spotlight: {
				popup: "w-[min(46rem,calc(100vw-2rem))]",
				panel: "rounded-2xl bg-popover p-2 shadow-(--overlay-shadow)",
				filters: "gap-1 self-start px-1 pt-1",
				pill: "rounded-full bg-primary/15",
				filter:
					"h-7 rounded-full px-3 text-xs data-[pressed]:text-primary data-[state=on]:text-primary",
				inputWrap: "h-14 gap-3 px-3",
				inputIcon: "size-5",
				input: "h-14 text-lg",
				kbd: "h-7 rounded-lg border-transparent bg-foreground/[0.06] px-2 text-xs",
				list: "border-border border-t pt-1.5",
				group:
					"[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1",
				groupHeading: "px-3 pt-2 pb-1",
				item: [
					"gap-3 rounded-lg px-3 py-2.5 text-base transition-[scale] duration-(--duration-fast) ease-[var(--ease-out)] active:scale-[0.99] motion-reduce:transition-none",
					"[&_svg:not([class*='size-'])]:size-[18px] [&_svg]:text-foreground",
				],
				marker: "rounded-lg bg-foreground/[0.08]",
				empty: "py-10",
				footer: "border-border border-t px-3 pt-2 pb-1",
			},
		},
	},
	defaultVariants: { variant: "default" },
});

export type CommandVariant = NonNullable<VariantProps<typeof commandFrame>["variant"]>;
