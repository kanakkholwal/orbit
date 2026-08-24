<script lang="ts">
  import { cn } from "$lib/utils";
  import {
    IconAlertCircle as CircleAlert,
    IconCircleCheck as CircleCheck,
    IconLoader2 as LoaderCircle,
  } from "@tabler/icons-svelte";

  type Status = "idle" | "processing" | "done" | "error";

  interface Props {
    status: Status;
    label?: string;
    class?: string;
  }

  let { status, label, class: className = "" }: Props = $props();

  // Every state carries a glyph as well as a tint: two of these hues collide
  // under tritanopia, so colour is never the only signal.
  const tone: Record<Status, string> = {
    idle: "border-border bg-paper text-muted-foreground",
    processing: "border-transparent bg-primary/10 text-primary",
    done: "border-transparent bg-success/10 text-success",
    error: "border-transparent bg-destructive/10 text-destructive",
  };

  const fallback: Record<Status, string> = {
    idle: "Ready",
    processing: "Working",
    done: "Done",
    error: "Error",
  };
</script>

<span
  class={cn(
    "label-eyebrow inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
    tone[status],
    className
  )}
>
  {#if status === "processing"}
    <LoaderCircle class="size-3 animate-spin" />
  {:else if status === "done"}
    <CircleCheck class="size-3" />
  {:else if status === "error"}
    <CircleAlert class="size-3" />
  {:else}
    <span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
  {/if}
  <span>{label ?? fallback[status]}</span>
</span>
