<script lang="ts">
  import { onMount } from "svelte";

  import { browser } from "$app/environment";
  import { page } from "$app/state";
  import { Editor } from "$components/application/pdf-editor";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { takePendingFiles } from "$lib/runtime/pending-files.svelte";
  import { pdfViewerState } from "$lib/runtime/pdf-viewer-state.svelte";

  const state = pdfViewerState;

  // Claimed during init: the UploadArea that normally takes handed files is replaced on mount.
  const handed = browser ? takePendingFiles(page.url.pathname) : [];

  onMount(() => {
    const ready = handed.length > 0 ? state.addFiles(handed) : Promise.resolve();
    ready.then(() => {
      state.viewerMounted = true;
    });

    return () => {
      state.viewerMounted = false;
    };
  });
</script>

{#if state.hasDocuments || state.viewerMounted}
  <div class="h-full min-h-0 w-full overflow-clip bg-background">
    <Editor
      mode="view"
      initialDocuments={state.initialDocuments}
      bind:incomingDocuments={state.incomingDocuments}
    />
  </div>
{:else}
  <div class="flex h-full min-h-0 items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-4xl">
      <UploadArea onFilesSelected={(files) => state.addFiles(files)} />
    </div>
  </div>
{/if}
