import { tv, type VariantProps } from "tailwind-variants";

/**
 * Shared modal contract: Dialog, AlertDialog and Command frame the same way. Base UI emits
 * `data-open`/`data-closed`, bits-ui `data-state`, so both are written out.
 */
export const dialogFrame = tv({
	slots: {
		// Fades in step with the panel; the primitive owns the top layer and inertness.
		backdrop: [
			"fixed inset-0 z-50 bg-black/50 opacity-0 backdrop-blur-[2px]",
			"transition-opacity duration-[var(--duration-exit)] ease-[var(--ease-ui-out)]",
			"data-[open]:opacity-100 data-[open]:duration-[var(--duration-dropdown)]",
			"data-[state=open]:opacity-100 data-[state=open]:duration-[var(--duration-dropdown)]",
			"starting:data-[open]:opacity-0 starting:data-[state=open]:opacity-0",
			"motion-reduce:transition-none",
		],
		// Motion is selected by the root; every path retraces itself on close.
		popup: [
			"fixed top-1/2 left-1/2 z-50 overflow-visible outline-none",
			"[transform:translate(-50%,-50%)_translate(var(--dialog-x,0),var(--dialog-y,0))_scale(var(--dialog-scale,1))]",
			"motion-reduce:transition-none",
		],
		panel: "rounded-2xl shadow-(--overlay-shadow)",
		// The icon-only close in the corner; a close with children styles itself.
		close:
			"absolute top-3 right-3 grid size-8 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
		footer: "flex items-center justify-end gap-2",
		body: "relative overflow-hidden",
	},
	variants: {
		motion: {
			zoom: {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-scale:var(--modal-enter-scale)] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-scale:var(--modal-enter-scale)] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-scale:var(--modal-enter-scale)]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-scale:var(--modal-enter-scale)]",
				],
			},
			fade: {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-scale:0.99] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-scale:0.99] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-scale:0.99]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-scale:0.99]",
				],
			},
			"slide-up": {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-y:1.5rem] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-y:1.5rem] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-y:1.5rem]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-y:1.5rem]",
				],
			},
			"slide-down": {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-y:-1.5rem] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-y:-1.5rem] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-y:-1.5rem]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-y:-1.5rem]",
				],
			},
			"slide-left": {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-x:1.5rem] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-x:1.5rem] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-x:1.5rem]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-x:1.5rem]",
				],
			},
			"slide-right": {
				popup: [
					"transition-[opacity,transform] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)]",
					"data-[closed]:opacity-0 data-[closed]:[--dialog-x:-1.5rem] data-[closed]:duration-[var(--duration-exit)]",
					"data-[state=closed]:opacity-0 data-[state=closed]:[--dialog-x:-1.5rem] data-[state=closed]:duration-[var(--duration-exit)]",
					"starting:data-[open]:opacity-0 starting:data-[open]:[--dialog-x:-1.5rem]",
					"starting:data-[state=open]:opacity-0 starting:data-[state=open]:[--dialog-x:-1.5rem]",
				],
			},
			morph: {
				popup: [
					"[clip-path:inset(0_0_0_0_round_var(--radius-2xl))] transition-[clip-path] duration-[var(--duration-overlay)] ease-[var(--ease-out-quad)] will-change-[clip-path]",
					"data-[closed]:[clip-path:inset(48%_48%_48%_48%_round_var(--radius-2xl))]",
					"data-[state=closed]:[clip-path:inset(48%_48%_48%_48%_round_var(--radius-2xl))]",
					"starting:data-[open]:[clip-path:inset(48%_48%_48%_48%_round_var(--radius-2xl))]",
					"starting:data-[state=open]:[clip-path:inset(48%_48%_48%_48%_round_var(--radius-2xl))]",
					"motion-reduce:[clip-path:none] motion-reduce:will-change-auto",
				],
			},
		},
		variant: {
			// The rim is the card surface; a hairline, not a lighter shade, lifts the body off it.
			framed: {
				panel: "bg-card p-1",
				footer: "px-2 pt-2 pb-1",
				body: "rounded-[11px] border border-border bg-popover p-5",
			},
			default: { panel: "bg-popover p-6", footer: "pt-6", body: "" },
		},
	},
	defaultVariants: { motion: "zoom", variant: "default" },
});

export type DialogVariant = NonNullable<VariantProps<typeof dialogFrame>["variant"]>;
export type DialogMotion = NonNullable<VariantProps<typeof dialogFrame>["motion"]>;

/** Dialog-only: AlertDialog and Command set their own fixed panel width. */
export const dialogWidth = tv({
	variants: {
		size: {
			sm: "max-w-sm",
			default: "max-w-lg",
			lg: "max-w-2xl",
			xl: "max-w-4xl",
		},
	},
	defaultVariants: { size: "default" },
});

export type DialogSize = NonNullable<VariantProps<typeof dialogWidth>["size"]>;
