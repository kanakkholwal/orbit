<script lang="ts">
  import "@fontsource/google-sans/400.css";
  import "@fontsource/google-sans/500.css";
  import "@fontsource/google-sans/600.css";
  import "@fontsource/google-sans/700.css";
  import "../app.css";
  let { children } = $props();

  import { Toaster } from "$components/ui/sonner";

  import { config } from "$constants/app";
  import { ModeWatcher } from "mode-watcher";
</script>

<svelte:head>
  <title>{config.appName}</title>
</svelte:head>

<ModeWatcher />
<Toaster />
<div class="relative min-h-screen w-full flex flex-col">
  {@render children()}
</div>

{#if config.adsensePublisherId}
  <script
    async
    id="adsense-script"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    crossorigin="anonymous"
  ></script>
{/if}
