<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";

let {
	open = $bindable(false),
	value = $bindable(""),
	items = [],
	type: _type,
	...rest
}: Omit<SelectPrimitive.RootProps, "type" | "value" | "onValueChange" | "items"> & {
	value?: string;
	items?: { value: string; label: string; disabled?: boolean }[];
	/** Accepted so shadcn's `type="single"` call sites compile; this select is single-value. */
	type?: "single";
} = $props();
</script>

<SelectPrimitive.Root bind:open bind:value type="single" {items} {...rest} />
