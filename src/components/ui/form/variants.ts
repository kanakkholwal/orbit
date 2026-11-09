import { tv, type VariantProps } from "tailwind-variants";
import type { FieldErrorEntry } from "$components/ui/field/variants.js";

export const form = tv({
	slots: {
		field: "",
	},
	variants: {
		spacing: {
			compact: { field: "gap-1.5" },
			comfortable: { field: "gap-2" },
		},
	},
	defaultVariants: { spacing: "comfortable" },
});

export type FormSpacing = NonNullable<VariantProps<typeof form>["spacing"]>;

/** What FormControl hands its control: the ids and aria state FormField owns. */
export type FormControlProps = {
	id: string;
	name: string;
	"aria-invalid": boolean;
	"aria-describedby": string;
};

/** The slice of a TanStack field's `state.meta` the form parts read. */
export type FormFieldMeta = {
	isTouched: boolean;
	isValid: boolean;
	errors: readonly unknown[];
};

/** Schema issues already carry `message`; a validator that returns a plain string is wrapped. */
function errorEntry(error: unknown): FieldErrorEntry {
	if (typeof error === "string") return { message: error };
	if (error && typeof error === "object" && "message" in error) {
		const { message } = error;
		return typeof message === "string" ? { message } : undefined;
	}
	return undefined;
}

/**
 * A field shows as invalid once it is touched and failing; submitting touches every field, so
 * untouched errors still appear after a submit attempt.
 */
export function formFieldState(meta: FormFieldMeta): {
	invalid: boolean;
	errors: FieldErrorEntry[];
} {
	const invalid = meta.isTouched && !meta.isValid;
	return { invalid, errors: invalid ? meta.errors.map(errorEntry) : [] };
}

/** Ids FormField derives from one base id, so label, control and messages stay linked. */
export function formFieldIds(id: string) {
	return { control: id, description: `${id}-description`, errors: `${id}-errors` };
}
