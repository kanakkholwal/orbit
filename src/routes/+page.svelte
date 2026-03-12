<script lang="ts">
  import { appState } from "$stores/app-state.svelte";
  import DesktopHome from "./Desktop.Home.svelte";
  import WebHome from "./Web.Home.svelte";

  let isTauri = $derived(appState.isTauri);
</script>

{#if isTauri}
  <DesktopHome />
{:else}
  <WebHome />
{/if}