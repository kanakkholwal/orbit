<script lang="ts">
import type { ComponentProps } from "svelte";
import FieldLabel from "$components/ui/field/field-label.svelte";
import { getFormField } from "./context";

let { ref = $bindable(null), ...rest }: ComponentProps<typeof FieldLabel> = $props();

const context = getFormField();
</script>

<FieldLabel bind:ref for={context.ids.control} {...rest} />
