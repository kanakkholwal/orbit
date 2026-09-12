<script lang="ts">
  import { page } from "$app/state";
  import { WorkspaceShell } from "$components/workspace";
  import { getTool } from "$tools/list";

  let { children } = $props();

  const tool = $derived(page.params.slug ? getTool(page.params.slug) : null);
</script>

<WorkspaceShell {tool}>
  {@render children?.()}
</WorkspaceShell>
