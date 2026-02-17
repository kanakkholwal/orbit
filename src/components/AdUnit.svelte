<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import { cn } from "$lib/utils";

  import { config } from "$constants/app";


  const adsTypes = {
    "display-horizontal": {
      adSlot: "6712325533",
      adFormat: "auto",
    },
    "display-square": {
      adSlot: "3535390051",
      adFormat: "auto",
    },
    "display-vertical": {
      adSlot: "9374040095",
      adFormat: "auto",
    },
    multiplex_vertical: {
      adSlot: "9146917182",
      adFormat: "autorelaxed",
    },
    multiplex_horizontal: {
      adSlot: "9716110433",
      adFormat: "autorelaxed",
    },
    in_article: {
      adSlot: "7833835515",
      adFormat: "autorelaxed",
    },
    in_feed: {
      adSlot: "7760865085",
      adFormat: "autorelaxed",
    },
  } as const;

  type AdType = keyof typeof adsTypes;

  let { adSlot, class: className }: { adSlot: AdType; class?: string } =
    $props();

  // Generate a unique ID for this instance
  const id = crypto.randomUUID().slice(0, 8);
  const adsProps = $derived(adsTypes[adSlot]);
  let adRef: HTMLElement | undefined = $state();

  // Trigger ad load when path or slot changes
  $effect(() => {
    // Dependency tracking: Accessing page.url.pathname makes this effect re-run on navigation
    const currentPath = page.url.pathname;
    const currentSlot = adSlot;

    if (dev) return;

    try {
      if (typeof window !== "undefined") {
        // @ts-ignore - adsbygoogle is added by the script tag
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("Adsense error:", e);
      if (adRef) {
        adRef.classList.add("error");
      }
    }
  });
</script>

{#if dev && !config.adsensePublisherId}
  <div class={cn("adsense-container empty", className)}>
    <div
      class={cn("relative flex min-h-25 w-full items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted/20",className)}
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-size-[16px_16px]"
      ></div>
      <div class="relative z-10 text-xs text-muted-foreground">
        [AdSpace: {adSlot.replace(/-/g, " ")}] - Set ADSENSE_PUBLISHER_ID in .env to see ads
      </div>
    </div>
  </div>
{:else}
  <div
    class={cn("adsense-container empty:hidden", className)}
    id={`adsense-${id}`}
  >
    <ins
      bind:this={adRef}
      id={`adsbygoogle-${id}`}
      class="adsbygoogle"
      style="display: block"
      data-ad-client={config.adsensePublisherId}
      data-ad-slot={adsProps.adSlot}
      data-ad-format={adsProps.adFormat}
      data-full-width-responsive="true"
    ></ins>
  </div>
{/if}

<style>
  .adsense-container {
    margin: 1rem 0;
    display: block;
    text-align: center;
  }

  .adsense-container.empty {
    display: none;
  }

  .adsense-container.error {
    border: 1px solid red;
    padding: 0.5rem;
    color: red;
    font-size: 0.875rem;
  }

  .adsbygoogle {
    display: block;
    width: 100%; /* okay for responsive ads */
    margin: auto;
  }
</style>
