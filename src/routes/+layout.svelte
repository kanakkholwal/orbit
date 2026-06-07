<script lang="ts">
  import "@fontsource-variable/google-sans";
  import "@fontsource-variable/source-code-pro";

  import "../app.css";

  let { children } = $props();

  import Seo from "$components/Seo.svelte";
  import { Toaster } from "$components/ui/sonner";
  import { config } from "$constants/app";
  import Analytics from "$lib/Analytics.svelte";
  import { setupPwa } from "$lib/pwa.svelte";
  import { getTauriTheme, listenToTauriTheme } from "$lib/runtime/isTauri";
  import { appState } from "$stores/app-state.svelte";
  import { ModeWatcher, setMode } from "mode-watcher";
  import { onMount, tick } from "svelte";
// import { ProgressBar } from "@prgm/sveltekit-progress-bar";
  import FeedbackPrompt from "$components/common/feedback-prompt.svelte";
  import Loader from "$components/common/loader.svelte";
  import TitleBar from "$components/layout/TitleBar.svelte";
  import { initTauriFileDrop } from "$lib/runtime/file-drop.svelte";
  import { loadRecentTools } from "$lib/runtime/recent-tools.svelte";

  let isTauri = $derived(appState.isTauri);

  // Attach the beforeinstallprompt listener at hydration time (before onMount)
  // so we don't miss the event when the browser fires it early.
  setupPwa();

  // Remove the boot splash screen after the app is mounted
  onMount(async () => {
    await tick();
    document.getElementById("boot")?.remove();

    // Initialize global app state
    await appState.init();

    // Recently-used tools (workspace "jump back in")
    loadRecentTools();

    if (appState.isTauri) {
      // Native drag-from-Explorer file drop bridge
      initTauriFileDrop();

      const theme = await getTauriTheme();
      const stored = localStorage.getItem("mode-watcher-mode");
      if (theme && (!stored || stored === "system")) {
        setMode(theme);
      }

      await listenToTauriTheme((theme) => {
        setMode(theme as "light" | "dark");
      });
    }
  });
</script>

<Seo
  title={config.appName}
  description={config.appDescription}
  keywords={config.appKeywords}
  isBase={true}
/>

<Loader />
<ModeWatcher />
<Toaster position="top-right" richColors />

{#if isTauri}
  <!-- Desktop: frameless window → custom title bar + fixed app frame -->
  <div class="flex h-screen w-full flex-col overflow-hidden fixed inset-0 bg-background">
    <TitleBar />
    <div class="relative flex min-h-0 w-full flex-1 flex-col">
      {@render children()}
    </div>
  </div>
{:else}
  <!-- Web: normal document flow (unchanged) -->
  <div class="relative flex min-h-screen w-full flex-col">
    {@render children()}
  </div>
{/if}

<FeedbackPrompt />

{#if config.googleAnalyticsId && config.googleAnalyticsId !== ""}
  <Analytics />
{/if}
{#if config.adsensePublisherId && config.adsensePublisherId !== ""}
  <script
    async
    id="adsense-script"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    crossorigin="anonymous"
  ></script>
{/if}
