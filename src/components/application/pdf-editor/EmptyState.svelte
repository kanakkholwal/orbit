<script lang="ts">
    import { Button } from "$components/ui/button";
    import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";
    import { FileTextIcon, PlusIcon } from "@lucide/svelte";

    const documentManagerCapability = useDocumentManagerCapability();

    let fileInput: HTMLInputElement;

    const handleOpenFile = () => {
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
</script>

<input
    bind:this={fileInput}
    type="file"
    accept="application/pdf"
    class="hidden"
    onchange={handleFileChange}
/>

<div class="flex flex-1 items-center justify-center bg-muted/20">
    <div class="max-w-xs text-center">
        <div class="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-muted">
            <FileTextIcon class="size-7 text-muted-foreground" />
        </div>
        <h2 class="mb-1.5 text-base font-semibold text-foreground">
            No Documents Open
        </h2>
        <p class="mb-6 text-sm text-muted-foreground">
            Open a PDF to get started. You can view multiple documents using tabs.
        </p>
        <Button onclick={handleOpenFile} size="sm">
            <PlusIcon class="size-4" />
            Open PDF
        </Button>
    </div>
</div>
