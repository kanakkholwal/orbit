<script lang="ts">
  import { goto } from "$app/navigation";
  import { appState } from "$stores/app-state.svelte";
  import WebHome from "./Web.Home.svelte";

  // Split by surface:
  //  • Web  → marketing landing (this page), which hands off into the app
  //           shell as soon as a tool is opened (/tools/*, /explore, /home).
  //  • Desktop (Tauri) → there is no marketing front door; drop straight into
  //           the in-shell workspace home.
  let isTauri = $derived(appState.isTauri);

  $effect(() => {
    if (isTauri) {
      goto("/home", { replaceState: true });
    }
  });
</script>

{#if !isTauri}
  <WebHome />
{/if}
