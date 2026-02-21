<script lang="ts">
  import { navigating } from "$app/state";
  import { fade } from "svelte/transition";

  import "@fontsource/google-sans/400.css";
  import "@fontsource/google-sans/500.css";
  import "@fontsource/google-sans/600.css";
  import "@fontsource/google-sans/700.css";
  import "../app.css";

  let { children } = $props();

  import Seo from "$components/Seo.svelte";
  import { Toaster } from "$components/ui/sonner";
  import { config } from "$constants/app";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, tick } from "svelte";

  // State for the smart progress bar
  let progress = $state(0);
  let isVisible = $state(false);

  $effect(() => {
    const nav = navigating;

    if (nav) {
      isVisible = true;
      progress = 15; // Instant visual feedback

      // Trickle progress asymptotically towards 90%
      const interval = setInterval(() => {
        if (progress < 90) {
          progress += (90 - progress) * 0.05;
        }
      }, 150);

      // If we are staying within the SPA, hook into the complete promise
      if (!nav.willUnload) {
        nav?.complete?.then(() => {
          clearInterval(interval);
          progress = 100; // Zip to the finish line

          // Wait for the width transition to finish before hiding
          setTimeout(() => {
            isVisible = false;
            // Reset width secretly after it fades out
            setTimeout(() => (progress = 0), 300);
          }, 400);
        });
      }

      // Cleanup interval if the effect re-runs before completion
      return () => clearInterval(interval);
    }
  });

  // Remove the boot splash screen after the app is mounted
  onMount(async () => {
    await tick();
    document.getElementById("boot")?.remove();
  });
</script>

<Seo title={config.appName} description={config.appDescription} isBase={true} />

{#if isVisible}
  <div
    class="fixed inset-x-0 top-0 z-100 h-0.5 w-full bg-transparent"
    transition:fade={{ duration: 200 }}
  >
    <div
      class="h-full bg-primary transition-all duration-300 ease-out"
      style="width: {progress}%; box-shadow: 0 0 10px hsl(var(--primary) / 0.5);"
    ></div>
  </div>
{/if}

<ModeWatcher />
<Toaster position="top-right" richColors />

<div class="relative flex min-h-screen w-full flex-col">
  {@render children()}
</div>

{#if config.adsensePublisherId && config.adsensePublisherId !== ""}
  <script
    async
    id="adsense-script"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    crossorigin="anonymous"
  ></script>
{/if}
