<script lang="ts">
  import { onDestroy } from "svelte";
  import StartScreen from "./StartScreen.svelte";
  import { CreatorState } from "./state.svelte";
  import Studio from "./Studio.svelte";

  const studio = new CreatorState();

  onDestroy(() => {
    studio.flushSave();
  });
</script>

<svelte:window onbeforeunload={() => studio.flushSave()} />

<div class="h-full min-h-0 overflow-clip bg-background">
  {#if studio.doc}
    <Studio {studio} />
  {:else}
    <StartScreen {studio} />
  {/if}
</div>
