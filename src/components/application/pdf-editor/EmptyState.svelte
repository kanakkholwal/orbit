<script lang="ts">
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";

  const documentManager = useDocumentManagerCapability();

  async function openFiles(files: File[]) {
    for (const [i, file] of files.entries()) {
      documentManager.provides?.openDocumentBuffer({
        buffer: await file.arrayBuffer(),
        name: file.name,
        autoActivate: i === files.length - 1,
      });
    }
  }
</script>

<div class="flex min-h-0 flex-1 items-center justify-center overflow-y-auto bg-canvas p-6 md:p-10">
  <div class="w-full max-w-3xl">
    <UploadArea accept=".pdf,application/pdf" onFilesSelected={openFiles}>
      {#snippet title()}
        <h3 class="text-heading-sm font-medium text-foreground">All documents closed</h3>
      {/snippet}
      {#snippet description()}
        <p class="max-w-sm text-pretty text-body text-muted-foreground">
          Drop a PDF to open it again. Each file opens in its own tab.
        </p>
      {/snippet}
    </UploadArea>
  </div>
</div>
