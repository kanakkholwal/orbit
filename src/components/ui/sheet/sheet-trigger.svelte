<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";
import { cn } from "$lib/cn.js";

let { class: classProp, ...rest }: SheetPrimitive.TriggerProps = $props();
</script>

<SheetPrimitive.Trigger {...rest} data-slot="sheet-trigger" class={cn("inline-flex", classProp)} />
