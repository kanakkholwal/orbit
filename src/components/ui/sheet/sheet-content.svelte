<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { type SheetSide, type SheetVariant, sheet } from "./variants";

let {
	class: classProp,
	side = "right",
	variant = "default",
	ref = $bindable(null),
	children,
	...rest
}: SheetPrimitive.ContentProps & { side?: SheetSide; variant?: SheetVariant } = $props();

const styles = $derived(sheet({ side, variant }));
</script>

<SheetPrimitive.Portal>
	<SheetPrimitive.Overlay data-slot="sheet-backdrop" class={styles.backdrop()} />
	<SheetPrimitive.Content
		bind:ref
		{...rest}
		data-slot="sheet-content"
		data-side={side}
		data-variant={variant}
		class={cn(styles.panel(), classProp)}
	>
		<div data-slot="sheet-body" class={styles.body()}>
			{@render children?.()}
		</div>
	</SheetPrimitive.Content>
</SheetPrimitive.Portal>
