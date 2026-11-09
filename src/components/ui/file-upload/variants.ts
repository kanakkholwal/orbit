import { tv, type VariantProps } from "tailwind-variants";

export const fileUpload = tv({
	slots: {
		root: "flex w-full min-w-0 flex-col gap-3",
		zone: [
			"group/zone relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed bg-background text-center outline-none",
			"transition-[padding,border-color,background-color] duration-(--duration-press) ease-(--ease-ui-out) motion-reduce:transition-none",
			"hover:border-border-strong hover:bg-foreground/[0.03] focus-visible:ring-2 focus-visible:ring-ring",
			"data-[dragging=true]:border-primary data-[dragging=true]:bg-[color-mix(in_oklch,var(--primary)_6%,transparent)]",
			"disabled:cursor-not-allowed disabled:opacity-50",
			// A refused drop shakes the zone, the same shake InputOTP uses.
			"data-[nudge=true]:animate-[otp-shake_240ms_var(--ease-ui-out)] motion-reduce:animate-none",
			"data-[compact=true]:flex-row data-[compact=true]:py-2.5",
		],
		zoneIcon: [
			"flex items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm dark:bg-muted [&_svg]:size-4",
			"transition-[translate,color,border-color] duration-(--duration-fast) ease-(--ease-ui-out) motion-reduce:transition-none",
			"group-data-[dragging=true]/zone:-translate-y-0.5 group-data-[dragging=true]/zone:border-primary group-data-[dragging=true]/zone:text-primary",
			"group-data-[compact=true]/zone:size-6 group-data-[compact=true]/zone:shadow-none",
		],
		zoneTitle: "font-medium text-foreground",
		zoneHint: "text-muted-foreground text-xs group-data-[compact=true]/zone:hidden",
		list: "flex flex-col gap-2",
		// Opens from 0fr on arrival and folds back before a removal, so the list never jumps.
		item: [
			"grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-(--duration-collapse) ease-(--ease-ui-out) starting:grid-rows-[0fr] starting:opacity-0",
			"data-[leaving=true]:grid-rows-[0fr] data-[leaving=true]:opacity-0 data-[leaving=true]:duration-(--duration-fast) motion-reduce:transition-none",
		],
		row: "flex min-w-0 items-center gap-3 rounded-lg border border-border bg-background p-2.5 transition-[border-color] duration-(--duration-dropdown)",
		thumb:
			"flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background text-muted-foreground transition-colors duration-(--duration-dropdown) [&_svg]:size-4",
		thumbImage: "size-full object-cover",
		body: "min-w-0 flex-1",
		line: "flex min-w-0 items-baseline justify-between gap-3 text-sm",
		name: "min-w-0 truncate font-medium text-foreground",
		meta: "shrink-0 text-muted-foreground text-xs tabular-nums",
		// The bar's row folds by grid rows once a file stops uploading, so the row eases shut.
		progress:
			"grid transition-[grid-template-rows,opacity] ease-(--ease-ui-out) motion-reduce:transition-none",
		track: "mt-1.5 h-1 w-full overflow-hidden rounded-full bg-(--track)",
		bar: "h-full w-full origin-left rounded-full bg-primary transition-[scale] duration-(--duration-overlay) ease-(--ease-ui-out) motion-reduce:transition-none",
		actions: "flex shrink-0 items-center gap-1",
	},
	variants: {
		/** `default`: a roomy drop zone over the list; `inline`: the zone is a slim bar from the start. */
		variant: {
			default: {},
			inline: { zone: "justify-start px-3 text-left" },
		},
		size: {
			sm: { zone: "px-4 py-5 text-sm", zoneIcon: "size-8", thumb: "size-8" },
			default: { zone: "px-6 py-8 text-sm", zoneIcon: "size-10", thumb: "size-10" },
		},
		/** One file's state; the item reads it for its colours and its bar's row. */
		status: {
			queued: { progress: "grid-rows-[0fr] opacity-0 duration-(--duration-exit)" },
			uploading: {
				thumb: "text-primary",
				progress: "grid-rows-[1fr] opacity-100 duration-(--duration-dropdown)",
			},
			done: { progress: "grid-rows-[0fr] opacity-0 duration-(--duration-exit)" },
			error: {
				row: "border-[color-mix(in_oklch,var(--destructive)_35%,transparent)]",
				thumb: "text-destructive-strong",
				meta: "text-destructive-strong",
				progress: "grid-rows-[0fr] opacity-0 duration-(--duration-exit)",
			},
		},
	},
	defaultVariants: { variant: "default", size: "default", status: "queued" },
});

export type FileUploadVariant = NonNullable<VariantProps<typeof fileUpload>["variant"]>;
export type FileUploadSize = NonNullable<VariantProps<typeof fileUpload>["size"]>;
export type FileUploadStatus = NonNullable<VariantProps<typeof fileUpload>["status"]>;
