<script lang="ts">
  import WorkspaceActionBar from "$components/workspace/WorkspaceActionBar.svelte";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    /** Status text or content shown on the left of the pinned action bar. */
    hint?: Snippet | string;
    class?: string;
  }

  let { children, hint }: Props = $props();
</script>

<WorkspaceActionBar>
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <div class="min-w-0 flex-1 text-body text-muted-foreground">
      {#if typeof hint === "string"}
        <span class="block truncate">{hint}</span>
      {:else if hint}
        {@render hint()}
      {/if}
    </div>
    <div class="flex flex-wrap items-center justify-end gap-2">
      {@render children()}
    </div>
  </div>
</WorkspaceActionBar>
