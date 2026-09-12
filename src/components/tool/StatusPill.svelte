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

  // Emerald and the success green collide under colour blindness, so every state also has a glyph.
  const tone: Record<Status, string> = {
    idle: "bg-muted text-muted-foreground",
    processing: "bg-primary/10 text-primary",
    done: "bg-success/10 text-success",
    error: "bg-destructive/10 text-destructive",
  };

  const fallback: Record<Status, string> = {
    idle: "Ready",
    processing: "Working",
    done: "Done",
    error: "Failed",
  };
</script>

<span
  class={cn(
    "inline-flex max-w-48 items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium",
    tone[status],
    className
  )}
>
  {#if status === "processing"}
    <LoaderCircle class="size-3.5 shrink-0 animate-spin" />
  {:else if status === "done"}
    <CircleCheck class="size-3.5 shrink-0" />
  {:else if status === "error"}
    <CircleAlert class="size-3.5 shrink-0" />
  {:else}
    <span class="size-1.5 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
  {/if}
  <span class="truncate">{label ?? fallback[status]}</span>
</span>
