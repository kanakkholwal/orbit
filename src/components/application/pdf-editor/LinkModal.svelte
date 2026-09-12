<script lang="ts">
    import SegmentedControl from "$components/tool/SegmentedControl.svelte";
    import { Button } from "$components/ui/button";
    import * as Drawer from "$components/ui/drawer";
    import { Input } from "$components/ui/input";
    import { Label } from "$components/ui/label";
    import { IsMobile } from "$lib/hooks/is-mobile.svelte";
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
    const isMobile = new IsMobile();
    const uid = $props.id();

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
        } else if (!createLinkOnAnnotation()) {
            createLinkFromSelection();
        }

        onClose?.();
    }

    function handlePageInput(e: Event) {
        const val = Number.parseInt((e.target as HTMLInputElement).value, 10);
        if (!Number.isNaN(val)) {
            pageNumber = Math.max(1, Math.min(totalPages, val));
        }
    }
</script>

<Drawer.Root
    open={isOpen}
    onOpenChange={(open) => {
        if (!open) onClose?.();
    }}
    onAnimationEnd={(open) => {
        if (!open) onExited?.();
    }}
    direction={isMobile.current ? "bottom" : "right"}
    shouldScaleBackground={false}
>
    <Drawer.Content class={isMobile.current ? "max-h-[85dvh] rounded-t-3xl" : "w-96 max-w-96"}>
        <form
            onsubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
            class="flex min-h-0 flex-1 flex-col"
        >
            <div class="flex flex-col gap-1 px-5 pb-4 pt-5">
                <Drawer.Title class="text-subheading font-medium text-foreground">
                    {translate("link.title") || "Insert link"}
                </Drawer.Title>
                <Drawer.Description class="text-body text-muted-foreground">
                    {translate("link.description") || "Send readers to a website or another page."}
                </Drawer.Description>
            </div>

            <div class="flex flex-col gap-6 overflow-y-auto px-5 pb-5">
                <SegmentedControl
                    name={`${uid}-target`}
                    bind:value={activeTab}
                    options={[
                        { value: "url", label: translate("link.url") || "URL" },
                        { value: "page", label: translate("link.page") || "Page" },
                    ]}
                />

                {#if activeTab === "url"}
                    <div class="flex flex-col gap-1.5">
                        <Label for={`${uid}-url`}>{translate("link.enterUrl") || "Enter URL"}</Label>
                        <Input id={`${uid}-url`} type="url" bind:value={url} placeholder="https://example.com" />
                    </div>
                {:else}
                    <div class="flex flex-col gap-1.5">
                        <Label for={`${uid}-page`}>{translate("link.enterPage") || "Page number"}</Label>
                        <Input
                            id={`${uid}-page`}
                            type="number"
                            min={1}
                            max={totalPages}
                            value={pageNumber}
                            oninput={handlePageInput}
                        />
                        <p class="text-body text-muted-foreground">
                            {translate("link.pageRange", { params: { totalPages } }) || `1 to ${totalPages}`}
                        </p>
                    </div>
                {/if}
            </div>

            <div
                class="mt-auto flex justify-end gap-2 border-t border-border px-5 pt-3"
                style="padding-bottom: max(env(safe-area-inset-bottom), 0.75rem);"
            >
                <Button type="button" variant="ghost" onclick={() => onClose?.()}>
                    {translate("common.cancel") || "Cancel"}
                </Button>
                <Button type="submit" variant="primary" disabled={!canSubmit}>
                    {translate("link.link") || "Insert link"}
                </Button>
            </div>
        </form>
    </Drawer.Content>
</Drawer.Root>
