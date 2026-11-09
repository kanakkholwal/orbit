<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import RollingDigits from "$components/text/rolling-digits/rolling-digits.svelte";

let {
	value,
	max,
	class: classProp,
	...rest
}: Omit<HTMLAttributes<HTMLParagraphElement>, "children"> & {
	/** Characters typed so far. */
	value: number;
	/** The textarea's `maxlength`, printed after the count. */
	max?: number;
} = $props();
</script>

<!-- A rolling character count for under a Textarea. -->
<p
	data-slot="textarea-count"
	{...rest}
	class={cn("ml-auto shrink-0 font-mono text-muted-foreground text-xs tabular-nums", classProp)}
>
	<RollingDigits {value} startOnView={false} />{max ? `/${max}` : ""}
</p>
