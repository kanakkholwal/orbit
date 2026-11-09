<script lang="ts">
import { Calendar as Primitive } from "bits-ui";
import { cn } from "$lib/cn.js";
import { calendar } from "./variants";

let { ref = $bindable(null), class: classProp, ...rest }: Primitive.DayProps = $props();
</script>

<Primitive.Day bind:ref data-slot="calendar-day" class={cn(calendar().day(), classProp)} {...rest} />
