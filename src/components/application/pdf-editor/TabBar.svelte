<script lang="ts">
  import CloseIcon from "$components/icons/registry/CloseIcon.svelte";
  import DocumentIcon from "$components/icons/registry/DocumentIcon.svelte";
  import PlusIcon from "$components/icons/registry/PlusIcon.svelte";
  import { Button, buttonVariants } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import type { DocumentState } from "@embedpdf/core";
  import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";

  interface TabBarProps {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
  }
  let { documentStates, activeDocumentId }: TabBarProps = $props();

  const documentManagerCapability = useDocumentManagerCapability();

  let fileInput: HTMLInputElement;

  const onSelect = (id: string) => {
    documentManagerCapability.provides?.setActiveDocument(id);
  };

  const onClose = (id: string) => {
    documentManagerCapability.provides?.closeDocument(id);
  };

  const onOpenFile = () => {
    fileInput?.click();
  };

  const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file || !documentManagerCapability.provides) return;

    const buffer = await file.arrayBuffer();
    documentManagerCapability.provides.openDocumentBuffer({
      buffer,
      name: file.name,
      autoActivate: true,
    });
    target.value = "";
  };

  const handleKeyDown = (e: KeyboardEvent, documentId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(documentId);
    }
  };
</script>

<input
  bind:this={fileInput}
  type="file"
  accept="application/pdf"
  class="hidden"
  onchange={handleFileChange}
/>

<div class="flex items-end gap-0.5 bg-accent p-2">
  <div
    class="flex flex-1 items-end gap-0.5 overflow-x-auto overflow-y-hidden no-scrollbar -mb-2"
  >
    {#each documentStates as document (document.id)}
      <div
        onclick={() => onSelect(document.id)}
        onkeydown={(e) => handleKeyDown(e, document.id)}
        role="tab"
        tabindex={0}
        aria-selected={activeDocumentId === document.id}
        class={cn(
          buttonVariants({
            size: "icon-sm",
            variant: activeDocumentId === document.id ? "outline" : "ghost",
          }),
          "group relative flex min-w-30 rounded-b-none pl-3 pr-2 cursor-pointer",
        )}
      >
        <DocumentIcon class="h-4 w-4 shrink-0" title="Document" />

        <span class="min-w-0 max-w-60 w-full flex-1 truncate">
          {document.name ?? `Document ${document.id.slice(0, 8)}`}
        </span>

        <Button
          onclick={(e) => {
            e.stopPropagation();
            onClose(document.id);
          }}
          variant={activeDocumentId === document.id ? "secondary" : "ghost"}
          size="icon-xs"
          aria-label="Close {document.name ?? 'document'}"
        >
          <CloseIcon class="size-3.5" title="Close" />
        </Button>
      </div>
    {/each}

    <Button
      onclick={onOpenFile}
      variant="secondary"
      size="icon-sm"
      aria-label="Open File"
      title="Open File"
      class="-mt-2"
    >
      <PlusIcon class="size-3.5" title="Open File" />
    </Button>
  </div>
</div>
