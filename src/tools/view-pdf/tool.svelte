<script lang="ts">
  import { onMount } from "svelte";

  import { Editor } from "$components/application/pdf-editor";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { pdfViewerState } from "$lib/runtime/pdf-viewer-state.svelte";

  const state = pdfViewerState;

  onMount(() => {
    state.viewerMounted = true;

    return () => {
      state.viewerMounted = false;
    };
  });
</script>

{#if state.hasDocuments || state.viewerMounted}
  <div class="h-full min-h-0 w-full overflow-hidden bg-card">
    <Editor
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
