<script lang="ts">
  import "@fontsource/google-sans/400.css";
  import "@fontsource/google-sans/500.css";
  import "@fontsource/google-sans/600.css";
  import "@fontsource/google-sans/700.css";
  import "../app.css";
  let { children } = $props();

  import { Toaster } from "$components/ui/sonner";

  import { ModeWatcher } from "mode-watcher";
</script>

<svelte:head>
  <title>Nexo PDF</title>
</svelte:head>

<ModeWatcher />
<Toaster />
<div
  class="relative min-h-screen w-full flex flex-col antialiased bg-(image:--noise-bg) text-foreground transition-colors duration-300"
>
  {@render children()}
</div>
