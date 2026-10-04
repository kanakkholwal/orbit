<script lang="ts">
import type { AnyFieldApi } from "@tanstack/svelte-form";
import type { HTMLAttributes } from "svelte/elements";
import Field from "$components/ui/field/field.svelte";
import type { FieldOrientation } from "$components/ui/field/variants.js";
import { cn } from "$lib/cn.js";
import { setFormField } from "./context";
import {
	type FormSpacing,
	formFieldIds,
	formFieldState,
	form as formStyles,
} from "./variants";

let {
	ref = $bindable(null),
	field,
	orientation = "vertical",
	spacing = "comfortable",
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLDivElement> & {
	ref?: HTMLDivElement | null;
	field: AnyFieldApi;
	orientation?: FieldOrientation;
	spacing?: FormSpacing;
} = $props();

const uid = $props.id();
const ids = formFieldIds(uid);
const state = $derived(formFieldState(field.state.meta));

setFormField({
	get field() {
		return field;
	},
	ids,
	get invalid() {
		return state.invalid;
	},
	get errors() {
		return state.errors;
	},
});
</script>

<Field
	bind:ref
	data-invalid={state.invalid}
	{orientation}
	class={cn(formStyles({ spacing }).field(), classProp)}
	{...rest}
>
	{@render children?.()}
</Field>
