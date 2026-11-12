/** Our toast layout on sonner's unstyled markup; `data-type` on the toast tints the icon. */
export const TOAST_CLASSES = {
	// A grid so DOM order stops mattering: icon | content | close on row one, actions under
	// the content on row two, whichever order sonner emits them in.
	toast: [
		"group/toast pointer-events-auto relative grid w-[calc(100vw-2rem)] max-w-sm grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3",
		"has-[[data-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]",
		"rounded-2xl border border-border bg-card/95 p-3 text-foreground shadow-2xl backdrop-blur-xl",
		"[&[data-type=success]_[data-icon]]:bg-success/10 [&[data-type=success]_[data-icon]]:text-success-strong",
		"[&[data-type=error]_[data-icon]]:bg-destructive/10 [&[data-type=error]_[data-icon]]:text-destructive-strong",
		"[&[data-type=warning]_[data-icon]]:bg-warning/10 [&[data-type=warning]_[data-icon]]:text-warning-strong",
		"[&[data-type=info]_[data-icon]]:bg-primary/10 [&[data-type=info]_[data-icon]]:text-primary",
		"[&[data-type=loading]_[data-icon]]:bg-primary/10 [&[data-type=loading]_[data-icon]]:text-primary",
	].join(" "),
	// relative: sonner centres its loader absolutely inside whatever holds the icon.
	icon: "relative col-start-1 row-start-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/[0.05] text-muted-foreground [&_svg]:size-3.5",
	content:
		"col-start-1 row-start-1 min-w-0 self-center group-has-[[data-icon]]/toast:col-start-2",
	title: "line-clamp-2 font-medium text-foreground text-sm leading-5",
	description: "mt-0.5 line-clamp-2 text-muted-foreground text-xs leading-4",
	actionButton:
		"col-start-1 row-start-2 mt-2 inline-flex h-7 items-center justify-self-start rounded-full bg-primary/[0.06] px-3 font-medium text-foreground text-xs transition-colors hover:bg-primary/[0.1] group-has-[[data-icon]]/toast:col-start-2",
	cancelButton:
		"col-start-2 row-start-2 mt-2 inline-flex h-7 items-center justify-self-end rounded-full px-3 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground group-has-[[data-icon]]/toast:col-start-3",
	closeButton:
		"-mt-0.5 -mr-0.5 col-start-2 row-start-1 inline-flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/[0.06] hover:text-foreground group-has-[[data-icon]]/toast:col-start-3 [&_svg]:size-3.5",
	// The loader stays mounted after a promise settles, flagged hidden; hide it for real.
	loader: "inline-flex data-[visible=false]:hidden",
};
