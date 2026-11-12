<script lang="ts">
  import { buttonVariants } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconHeart as Heart } from "$lib/icons";
  import { cn } from "$lib/utils";

  let { class: className = "" }: { class?: string } = $props();
</script>

<div class={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
  <div class="flex min-w-0 flex-col gap-0.5">
    <p class="text-sm font-medium text-foreground">Free, no ads in the apps, no uploads.</p>
    <p class="text-sm text-muted-foreground">Sponsoring pays for new tools and keeps Orbit open source.</p>
  </div>
  <a
    href={config.sponsor}
    target="_blank"
    rel="noopener noreferrer"
    class={cn(buttonVariants({ variant: "outline" }), "min-h-11 shrink-0 gap-2")}
  >
    <Heart class="size-4" />
    Sponsor on GitHub
  </a>
</div>
