<script lang="ts">
  import "@fontsource-variable/google-sans";

  import "../app.css";

  let { children } = $props();

  import Seo from "$components/Seo.svelte";
  import { Toaster } from "$components/ui/sonner";
  import { config } from "$constants/app";
  import { ModeWatcher } from "mode-watcher";
  import { onMount, tick } from "svelte";

  // import { ProgressBar } from "@prgm/sveltekit-progress-bar";
  import Loader from "$components/common/loader.svelte";

  // Remove the boot splash screen after the app is mounted
  onMount(async () => {
    await tick();
    document.getElementById("boot")?.remove();
  });
</script>

<Seo title={config.appName} description={config.appDescription} isBase={true} />

<!-- <ProgressBar class="text-emerald-500" /> -->
<Loader />
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
