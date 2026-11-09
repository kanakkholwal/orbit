<script lang="ts">
  import { Badge } from "$components/ui/badge";
  import {
    IconAlertCircle as CircleAlert,
    IconCircleCheck as CircleCheck,
    IconLoader2 as LoaderCircle,
  } from "$lib/icons";
  import { cn } from "$lib/utils";

  type Status = "idle" | "processing" | "done" | "error";

  interface Props {
    status: Status;
    label?: string;
    class?: string;
  }

  let { status, label, class: className = "" }: Props = $props();

  const variant = {
    idle: "secondary",
    processing: "default",
    done: "success",
    error: "destructive",
  } as const;

  const fallback: Record<Status, string> = {
    idle: "Ready",
    processing: "Working",
    done: "Done",
    error: "Failed",
  };
</script>

<Badge variant={variant[status]} class={cn("max-w-48", className)}>
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
</Badge>
