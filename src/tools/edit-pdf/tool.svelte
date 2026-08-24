<script lang="ts">
  import { Editor } from "$components/application/pdf-editor";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { EditPdfState } from "./helper.svelte";

  const state = new EditPdfState();
</script>

{#if state.hasFiles}
  <div
    class="h-[calc(100dvh-220px)] min-h-125 w-full overflow-hidden rounded-md border border-border bg-card"
  >
    <Editor initialDocuments={state.initialDocuments} />
  </div>
{:else}
  <UploadArea onFilesSelected={(files) => state.addFiles(files)} />
{/if}
