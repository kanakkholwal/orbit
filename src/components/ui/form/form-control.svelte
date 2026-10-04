<script lang="ts">
import type { Snippet } from "svelte";
import { getFormField } from "./context";
import type { FormControlProps } from "./variants";

let {
	child,
}: {
	/** Spread `props` onto the control; value and change handling stay yours. */
	child: Snippet<[{ props: FormControlProps & { onblur: () => void } }]>;
} = $props();

const context = getFormField();
const control = $derived({
	id: context.ids.control,
	name: context.field.name,
	"aria-invalid": context.invalid,
	"aria-describedby": context.invalid
		? `${context.ids.description} ${context.ids.errors}`
		: context.ids.description,
	onblur: context.field.handleBlur,
});
</script>

{@render child({ props: control })}
