<script lang="ts">
  import { cn } from "$lib/utils";
  import { IconLoader2 as Loader } from "$lib/icons";

  interface LoadingSpinnerProps {
    message?: string;
    class?: string;
  }

  let { message, class: className }: LoadingSpinnerProps = $props();
</script>

<div role="status" class={cn("flex flex-col items-center gap-3 text-sm text-muted-foreground", className)}>
  <Loader class="size-5 animate-spin text-primary" />
  <span class={message ? undefined : "sr-only"}>{message ?? "Loading"}</span>
</div>
