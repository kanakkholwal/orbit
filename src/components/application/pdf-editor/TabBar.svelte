<script lang="ts">
  import { cn } from "$lib/utils";
  import type { DocumentState } from "@embedpdf/core";
  import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";
  import { IconFileTypePdf as FileIcon, IconPlus as Plus, IconX as X } from "@tabler/icons-svelte";
  import { chromeButton } from "./chrome";

  interface TabBarProps {
    documentStates: DocumentState[];
    activeDocumentId: string | null;
  }

  let { documentStates, activeDocumentId }: TabBarProps = $props();

  const documentManager = useDocumentManagerCapability();

  let fileInput = $state<HTMLInputElement | null>(null);
  let tabList = $state<HTMLDivElement | null>(null);

  const nameOf = (doc: DocumentState) => doc.name ?? `Document ${doc.id.slice(0, 6)}`;

  async function openFiles(e: Event & { currentTarget: HTMLInputElement }) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    for (const [i, file] of files.entries()) {
      documentManager.provides?.openDocumentBuffer({
        buffer: await file.arrayBuffer(),
        name: file.name,
        autoActivate: i === files.length - 1,
      });
    }
  }

  function moveFocus(e: KeyboardEvent, index: number) {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = documentStates[(index + step + documentStates.length) % documentStates.length];
    if (!next) return;
    documentManager.provides?.setActiveDocument(next.id);
    tabList?.querySelector<HTMLButtonElement>(`[data-doc-tab="${next.id}"]`)?.focus();
  }

  $effect(() => {
    const tab = tabList?.querySelector<HTMLElement>(`[data-doc-tab="${activeDocumentId}"]`)?.parentElement;
    if (!tabList || !tab) return;
    // scrollIntoView would also scroll the clipped shell ancestors.
    const { offsetLeft, offsetWidth } = tab;
    if (offsetLeft < tabList.scrollLeft) tabList.scrollLeft = offsetLeft;
    else if (offsetLeft + offsetWidth > tabList.scrollLeft + tabList.clientWidth)
      tabList.scrollLeft = offsetLeft + offsetWidth - tabList.clientWidth;
  });
</script>

<input bind:this={fileInput} type="file" accept="application/pdf" multiple class="hidden" onchange={openFiles} />

<div class="flex h-12 shrink-0 items-center gap-1 border-b border-border bg-background px-2">
  <div
    bind:this={tabList}
    role="tablist"
    aria-label="Open documents"
    class="no-scrollbar relative flex min-w-0 items-center gap-1 overflow-x-auto"
  >
    {#each documentStates as doc, index (doc.id)}
      {@const active = doc.id === activeDocumentId}
      <div
        class={cn(
          "group relative flex h-9 w-44 shrink-0 items-center rounded-lg transition-colors duration-150",
          active ? "bg-muted" : "hover:bg-muted/60"
        )}
      >
        <button
          type="button"
          role="tab"
          data-doc-tab={doc.id}
          aria-selected={active}
          tabindex={active ? 0 : -1}
          title={nameOf(doc)}
          onclick={() => documentManager.provides?.setActiveDocument(doc.id)}
          onkeydown={(e) => moveFocus(e, index)}
          class={cn(
            "flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg pl-2.5 pr-9 text-left text-body outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
            active ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
          )}
        >
          <FileIcon class={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
          <span class="truncate">{nameOf(doc)}</span>
        </button>
        <button
          type="button"
          onclick={() => documentManager.provides?.closeDocument(doc.id)}
          aria-label={`Close ${nameOf(doc)}`}
          title="Close"
          class="absolute right-1 grid size-7 place-items-center rounded-md text-muted-foreground outline-none transition-colors duration-150 hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:focus-visible:opacity-100 pointer-fine:group-has-aria-selected:opacity-100"
        >
          <X class="size-3.5" />
        </button>
      </div>
    {/each}
  </div>

  <button
    type="button"
    onclick={() => fileInput?.click()}
    aria-label="Open another PDF"
    title="Open another PDF"
    class={chromeButton({ shape: "icon" })}
  >
    <Plus class="size-4.5" />
  </button>
</div>
