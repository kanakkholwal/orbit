<script lang="ts">
  import { Editor } from "$components/application/pdf-editor";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { EditPdfState } from "./helper.svelte";

  const state = new EditPdfState();
</script>

{#if state.hasFiles}
  <div class="h-full min-h-0 w-full overflow-clip bg-background">
    <Editor initialDocuments={state.initialDocuments} />
  </div>
{:else}
  <div class="flex h-full min-h-0 items-center justify-center p-6 md:p-10">
    <div class="w-full max-w-4xl">
      <UploadArea onFilesSelected={(files) => state.addFiles(files)} />
    </div>
  </div>
{/if}
