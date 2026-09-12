<script lang="ts">
  import { workspace } from "$stores/workspace.svelte";
  import type { Snippet } from "svelte";

  /** Renders `children` in the action bar pinned under the workspace. */
  let { children }: { children: Snippet } = $props();

  $effect(() => {
    const content = children;
    workspace.actionBar = content;
    return () => {
      if (workspace.actionBar === content) workspace.actionBar = null;
    };
  });
</script>
