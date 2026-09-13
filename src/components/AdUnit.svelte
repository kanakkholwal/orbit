<script lang="ts">
  import { dev } from "$app/environment";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { onMount } from "svelte";

  const adsTypes = {
    "display-horizontal": { adSlot: "6712325533", adFormat: "auto" },
    "display-square": { adSlot: "3535390051", adFormat: "auto" },
    "display-vertical": { adSlot: "9374040095", adFormat: "auto" },
    multiplex_vertical: { adSlot: "9146917182", adFormat: "autorelaxed" },
    multiplex_horizontal: { adSlot: "9716110433", adFormat: "autorelaxed" },
    in_article: { adSlot: "7833835515", adFormat: "autorelaxed" },
    in_feed: { adSlot: "7760865085", adFormat: "autorelaxed" },
  } as const;

  type AdType = keyof typeof adsTypes;

  let { adSlot, class: className }: { adSlot: AdType; class?: string } = $props();

  const ad = $derived(adsTypes[adSlot]);
  const enabled = $derived(!!config.adsensePublisherId && !appState.isTauri);

  onMount(() => {
    if (!enabled) return;
    try {
      const w = window as unknown as { adsbygoogle?: object[] };
      w.adsbygoogle ??= [];
      w.adsbygoogle.push({});
    } catch (error) {
      console.error("AdSense failed to fill a unit", error);
    }
  });
</script>

{#if enabled}
  <aside class={cn("ad-unit", className)} aria-label="Advertisement">
    <ins
      class="adsbygoogle"
      style="display: block"
      data-ad-client={config.adsensePublisherId}
      data-ad-slot={ad.adSlot}
      data-ad-format={ad.adFormat}
      data-full-width-responsive="true"
    ></ins>
  </aside>
{:else if dev}
  <div class={cn("grid min-h-24 place-items-center rounded-2xl border border-dashed border-border text-caption text-muted-foreground", className)}>
    Ad slot: {adSlot}
  </div>
{/if}

<style>
  .ad-unit {
    display: block;
    width: 100%;
    text-align: center;
  }

  /* AdSense marks units it could not fill; collapse them so no empty gap is left behind. */
  .ad-unit:has(:global(ins[data-ad-status="unfilled"])) {
    display: none;
  }
</style>
