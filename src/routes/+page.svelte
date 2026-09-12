<script lang="ts">
  import { page } from "$app/state";
  import { appState } from "$stores/app-state.svelte";
  import DesktopHome from "./Desktop.Home.svelte";
  import WebHome from "./Web.Home.svelte";

  const previewDesktop = $derived(page.url.searchParams.get("mode") === "desktop");
</script>

{#if appState.isTauri || previewDesktop}
  <DesktopHome preview={!appState.isTauri} />
{:else}
  <WebHome />
{/if}
