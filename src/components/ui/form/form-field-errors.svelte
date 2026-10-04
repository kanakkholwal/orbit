<script lang="ts">
import type { ComponentProps } from "svelte";
import FieldError from "$components/ui/field/field-error.svelte";
import { getFormField } from "./context";

let {
	ref = $bindable(null),
	...rest
}: Omit<ComponentProps<typeof FieldError>, "errors"> = $props();

const context = getFormField();
</script>

<FieldError bind:ref id={context.ids.errors} errors={context.errors} {...rest} />
