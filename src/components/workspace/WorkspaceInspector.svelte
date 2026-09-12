<script lang="ts">
  import { workspace } from "$stores/workspace.svelte";
  import type { Snippet } from "svelte";

  /** Renders `children` in the shell's inspector column (a drawer on narrow screens). */
  let { title = "Settings", children }: { title?: string; children: Snippet } = $props();

  $effect(() => {
    const slot = { title, content: children };
    workspace.inspector = slot;
    return () => {
      if (workspace.inspector === slot) workspace.inspector = null;
    };
  });
</script>
