<script lang="ts">
  import { isTauriApp } from "$lib/runtime/isTauri";
  import { onMount } from "svelte";
  import DesktopHome from "./Desktop.Home.svelte";
  import WebHome from "./Web.Home.svelte";

  let isTauri = false;
  onMount(async () => {
    isTauri = await isTauriApp();
  });

</script>

{#if isTauri}
  <DesktopHome />
{:else}
  <WebHome />
{/if}