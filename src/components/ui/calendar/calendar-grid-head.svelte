<script lang="ts">
import { Calendar as Primitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { calendar } from "./variants";

let {
	ref = $bindable(null),
	class: classProp,
	...rest
}: Primitive.GridHeadProps = $props();
</script>

<Primitive.GridHead bind:ref class={classProp} {...rest} />
