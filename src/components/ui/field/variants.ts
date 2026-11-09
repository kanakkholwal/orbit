import { tv, type VariantProps } from "tailwind-variants";

export const field = tv({
	slots: {
		set: "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
		group:
			"group/field-group @container/field-group flex w-full flex-col gap-7 *:data-[slot=field-group]:gap-4",
		root: "group/field flex w-full gap-2 data-[invalid=true]:text-destructive-strong",
		content: "group/field-content flex flex-1 flex-col gap-1 leading-snug",
		label: [
			"group/field-label peer/field-label flex w-fit gap-2 leading-snug",
			"group-data-[disabled=true]/field:opacity-50",
			"has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:border-border *:data-[slot=field]:p-3",
			"has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-2 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring",
			"has-data-[state=checked]:border-foreground/30 has-data-[state=checked]:bg-foreground/[0.03]",
		],
		title:
			"flex w-fit items-center gap-2 font-medium text-foreground text-sm leading-snug group-data-[disabled=true]/field:opacity-50",
		description: [
			"text-left font-normal text-muted-foreground text-sm leading-normal",
			"group-has-data-[orientation=horizontal]/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
			"last:mt-0 nth-last-2:-mt-1",
			"[&>a:hover]:text-foreground [&>a]:underline [&>a]:underline-offset-4",
		],
		separator: "relative -my-2 h-5 text-muted-foreground text-xs",
		separatorContent: "relative mx-auto block w-fit bg-background px-2",
		error: "font-normal text-destructive-strong text-sm",
	},
	variants: {
		orientation: {
			vertical: { root: "flex-col *:w-full [&>.sr-only]:w-auto" },
			horizontal: {
				root: [
					"flex-row items-center has-[>[data-slot=field-content]]:items-start",
					"*:data-[slot=field-label]:flex-auto",
					"has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
				],
			},
			responsive: {
				root: [
					"flex-col *:w-full [&>.sr-only]:w-auto",
					"@md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto",
					"@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto",
				],
			},
		},
		// `sm` is the compact inspector density: settings sheets and property panels.
		size: {
			default: {},
			sm: { set: "gap-2.5", group: "gap-2.5", root: "gap-1.5 text-xs" },
		},
	},
	compoundVariants: [
		{
			orientation: "horizontal",
			size: "sm",
			class: {
				root: "*:data-[slot=field-label]:w-20 *:data-[slot=field-label]:flex-none *:data-[slot=field-label]:truncate *:data-[slot=field-label]:text-muted-foreground *:data-[slot=field-label]:text-xs",
			},
		},
	],
	defaultVariants: { orientation: "vertical", size: "default" },
});

export type FieldOrientation = NonNullable<VariantProps<typeof field>["orientation"]>;
export type FieldSize = NonNullable<VariantProps<typeof field>["size"]>;

/** A section heading, or a label-sized caption over a group of controls. */
export const fieldLegend = tv({
	base: "mb-3 font-medium text-foreground",
	variants: {
		variant: {
			legend: "text-base",
			label: "text-sm",
			eyebrow: "mb-2 text-muted-foreground text-xs uppercase tracking-wider",
		},
	},
	defaultVariants: { variant: "legend" },
});

export type FieldLegendVariant = NonNullable<VariantProps<typeof fieldLegend>["variant"]>;

/** shadcn's error shape: `{ message }` entries, as zod and react-hook-form report them. */
export type FieldErrorEntry = { message?: string } | undefined;

/** Distinct error messages, first occurrence kept, blanks dropped. */
export function fieldErrorMessages(
	errors: readonly FieldErrorEntry[] | undefined,
): string[] {
	const seen = new Set<string>();
	for (const error of errors ?? []) if (error?.message) seen.add(error.message);
	return [...seen];
}
