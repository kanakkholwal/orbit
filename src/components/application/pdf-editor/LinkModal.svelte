<script lang="ts">
    import { Button } from "$components/ui/button";
    import { Input } from "$components/ui/input";
    import { Label } from "$components/ui/label";
    import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
    } from "$components/ui/dialog";
    import {
        ignore,
        PdfActionType,
        PdfAnnotationBorderStyle,
        PdfAnnotationReplyType,
        PdfAnnotationSubtype,
        PdfBlendMode,
        type PdfLinkTarget,
        PdfZoomMode,
        uuidV4,
    } from "@embedpdf/models";
    import { useAnnotationCapability } from "@embedpdf/plugin-annotation/svelte";
    import { useTranslations } from "@embedpdf/plugin-i18n/svelte";
    import { useScrollCapability } from "@embedpdf/plugin-scroll/svelte";
    import { useSelectionCapability } from "@embedpdf/plugin-selection/svelte";

    type LinkTab = "url" | "page";
    type LinkSource = "annotation" | "selection";

    interface Props {
        documentId: string;
        isOpen?: boolean;
        onClose?: () => void;
        onExited?: () => void;
        source?: LinkSource;
    }

    let {
        documentId,
        isOpen = false,
        onClose,
        onExited,
        source,
    }: Props = $props();

    const scrollCapability = useScrollCapability();
    const annotationCapability = useAnnotationCapability();
    const selectionCapability = useSelectionCapability();
    const { translate } = useTranslations(() => documentId);

    let activeTab = $state<LinkTab>("url");
    let url = $state("");
    let pageNumber = $state(1);

    const totalPages = $derived(
        scrollCapability.provides?.forDocument(documentId).getTotalPages() || 1,
    );

    const annotationScope = $derived(
        annotationCapability.provides?.forDocument(documentId),
    );

    const selectionScope = $derived(
        selectionCapability.provides?.forDocument(documentId),
    );

    const selectedAnnotation = $derived(
        annotationScope?.getSelectedAnnotation(),
    );
    const textSelection = $derived(
        selectionScope?.getFormattedSelection() ?? [],
    );

    $effect(() => {
        if (isOpen) {
            activeTab = "url";
            url = "";
            pageNumber = 1;
        }
    });

    const canSubmit = $derived(activeTab === "page" || url.trim().length > 0);

    function handleSubmit() {
        let target: PdfLinkTarget;

        if (activeTab === "url") {
            if (!url.trim()) return;
            target = {
                type: "action",
                action: { type: PdfActionType.URI, uri: url.trim() },
            };
        } else {
            target = {
                type: "destination",
                destination: {
                    pageIndex: pageNumber - 1,
                    zoom: { mode: PdfZoomMode.FitPage },
                    view: [],
                },
            };
        }

        const createLinkOnAnnotation = () => {
            if (!selectedAnnotation) return false;
            const rects =
                "segmentRects" in selectedAnnotation.object
                    ? selectedAnnotation.object.segmentRects
                    : [selectedAnnotation.object.rect];

            for (const rect of rects ?? []) {
                annotationScope?.createAnnotation(
                    selectedAnnotation.object.pageIndex,
                    {
                        id: uuidV4(),
                        type: PdfAnnotationSubtype.LINK,
                        pageIndex: selectedAnnotation.object.pageIndex,
                        rect,
                        inReplyToId: selectedAnnotation.object.id,
                        replyType: PdfAnnotationReplyType.Group,
                        target,
                        strokeStyle: PdfAnnotationBorderStyle.UNDERLINE,
                        strokeColor: "#0000FF",
                        strokeWidth: 2,
                    },
                );
            }
            return true;
        };

        const createLinkFromSelection = () => {
            if (textSelection.length === 0) return false;
            const selectionText = selectionScope?.getSelectedText();

            for (const sel of textSelection) {
                selectionText?.wait((text) => {
                    const highlightId = uuidV4();
                    annotationScope?.createAnnotation(sel.pageIndex, {
                        id: highlightId,
                        created: new Date(),
                        flags: ["print"],
                        type: PdfAnnotationSubtype.HIGHLIGHT,
                        blendMode: PdfBlendMode.Multiply,
                        pageIndex: sel.pageIndex,
                        rect: sel.rect,
                        segmentRects: sel.segmentRects,
                        strokeColor: "#FFFFFF",
                        opacity: 0,
                        custom: { text: text.join("\n") },
                    });

                    const segmentRects = sel.segmentRects ?? [sel.rect];
                    for (const segmentRect of segmentRects) {
                        annotationScope?.createAnnotation(sel.pageIndex, {
                            id: uuidV4(),
                            type: PdfAnnotationSubtype.LINK,
                            pageIndex: sel.pageIndex,
                            rect: segmentRect,
                            inReplyToId: highlightId,
                            replyType: PdfAnnotationReplyType.Group,
                            target,
                            strokeStyle: PdfAnnotationBorderStyle.UNDERLINE,
                            strokeColor: "#0000FF",
                            strokeWidth: 2,
                        });
                    }

                    annotationScope?.selectAnnotation(
                        sel.pageIndex,
                        highlightId,
                    );
                }, ignore);
            }
            selectionScope?.clear();
            return true;
        };

        if (source === "annotation") {
            createLinkOnAnnotation();
        } else if (source === "selection") {
            createLinkFromSelection();
        } else {
            if (!createLinkOnAnnotation()) {
                createLinkFromSelection();
            }
        }

        onClose?.();
    }

    function handlePageInput(e: Event) {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val)) {
            pageNumber = Math.max(1, Math.min(totalPages, val));
        }
    }
</script>

<Dialog open={isOpen} onOpenChange={onClose}>
    <DialogHeader>
        <DialogTitle>
            {translate("link.title") || "Insert Link"}
        </DialogTitle>
        <DialogDescription>
            {translate("link.description") || "Add a link destination"}
        </DialogDescription>
    </DialogHeader>
    <DialogContent>
        {#snippet children()}
            <form
                onsubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
                class="space-y-4"
            >
                <div class="flex gap-0 border-b border-border">
                    <button
                        type="button"
                        class="relative px-3 py-2 text-sm font-medium transition-colors {activeTab ===
                        'url'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'}"
                        onclick={() => (activeTab = "url")}
                    >
                        {translate("link.url") || "URL"}
                        {#if activeTab === "url"}
                            <span class="absolute inset-x-0 bottom-0 h-0.5 bg-primary"></span>
                        {/if}
                    </button>
                    <button
                        type="button"
                        class="relative px-3 py-2 text-sm font-medium transition-colors {activeTab ===
                        'page'
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground'}"
                        onclick={() => (activeTab = "page")}
                    >
                        {translate("link.page") || "Page"}
                        {#if activeTab === "page"}
                            <span class="absolute inset-x-0 bottom-0 h-0.5 bg-primary"></span>
                        {/if}
                    </button>
                </div>

                {#if activeTab === "url"}
                    <div class="space-y-1.5">
                        <Label for="link-url-input" class="text-xs">
                            {translate("link.enterUrl") || "Enter URL"}
                        </Label>
                        <Input
                            id="link-url-input"
                            type="url"
                            bind:value={url}
                            placeholder="https://example.com"
                            class="h-9"
                        />
                    </div>
                {:else}
                    <div class="space-y-1.5">
                        <Label for="link-page-input" class="text-xs">
                            {translate("link.enterPage") || "Page Number"}
                        </Label>
                        <Input
                            id="link-page-input"
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageNumber}
                            oninput={handlePageInput}
                            class="h-9"
                        />
                        <p class="text-xs text-muted-foreground">
                            {translate("link.pageRange", {
                                params: { totalPages },
                            }) || `1 to ${totalPages}`}
                        </p>
                    </div>
                {/if}
            </form>
        {/snippet}
    </DialogContent>

    <DialogFooter>
        {#snippet children()}
            <Button variant="ghost" size="sm" onclick={onClose}>
                {translate("common.cancel") || "Cancel"}
            </Button>
            <Button size="sm" disabled={!canSubmit} onclick={handleSubmit}>
                {translate("link.link") || "Insert Link"}
            </Button>
        {/snippet}
    </DialogFooter>
</Dialog>
