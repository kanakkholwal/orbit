<script lang="ts">
import { Select as SelectPrimitive } from "bits-ui";
import type { SelectTriggerSize } from "./variants";
import { setSelectSize } from "./context";

let {
	open = $bindable(false),
	value = $bindable(""),
	items = [],
	size = "default",
	type: _type,
	onValueChange,
	...rest
}: Omit<SelectPrimitive.RootProps, "type" | "value" | "onValueChange" | "items"> & {
	value?: string;
	items?: { value: string; label: string; disabled?: boolean }[];
	size?: SelectTriggerSize;
	/** Accepted so shadcn's `type="single"` call sites compile; this select is single-value. */
	type?: "single";
	onValueChange?: (value: string) => void;
} = $props();

setSelectSize(() => size);
</script>

<SelectPrimitive.Root bind:open bind:value type="single" onValueChange={(v) => onValueChange?.(v)} {items} {...rest} />
