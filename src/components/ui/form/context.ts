import type { AnyFieldApi, AnyFormApi } from "@tanstack/svelte-form";
import { createContext } from "svelte";
import type { FieldErrorEntry } from "$components/ui/field/variants.js";
import type { formFieldIds } from "./variants";

/** Getters, so every part reads the field's live state rather than a snapshot. */
export type FormFieldContext = {
	readonly field: AnyFieldApi;
	readonly ids: ReturnType<typeof formFieldIds>;
	readonly invalid: boolean;
	readonly errors: FieldErrorEntry[];
};

export const [getFormField, setFormField] = createContext<FormFieldContext>();
export const [getForm, setForm] = createContext<{ readonly form: AnyFormApi }>();
