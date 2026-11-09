<script lang="ts">
import type { ComponentProps } from "svelte";
import FieldDescription from "$components/ui/field/field-description.svelte";
import { getFormField } from "./context";

let { ref = $bindable(null), ...rest }: ComponentProps<typeof FieldDescription> =
	$props();

const context = getFormField();
</script>

<FieldDescription bind:ref id={context.ids.description} {...rest} />
