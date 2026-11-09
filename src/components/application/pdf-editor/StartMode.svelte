<script lang="ts">
  import type { PluginRegistry } from "@embedpdf/core";
  import type { UIPlugin } from "@embedpdf/plugin-ui";

  let { registry, documentId }: { registry: PluginRegistry | null; documentId: string } = $props();

  let applied = false;

  $effect(() => {
    if (applied || !registry) return;
    const ui = registry.getPlugin<UIPlugin>("ui")?.provides();
    if (!ui) return;
    applied = true;
    ui.setActiveToolbar("top", "secondary", "redaction-toolbar", documentId);
  });
</script>
