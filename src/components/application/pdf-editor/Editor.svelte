<script lang="ts">
  import CommentSidebar from "./CommentSidebar.svelte";
  import {
    commands,
    dutchTranslations,
    englishTranslations,
    germanTranslations,
    paramResolvers,
    spanishTranslations,
    viewerUISchema,
  } from "./config";
  import CustomZoomToolbar from "./CustomZoomToolbar.svelte";
  import DocumentPasswordPrompt from "./DocumentPasswordPrompt.svelte";
  import EmptyState from "./EmptyState.svelte";
  import LinkModal from "./LinkModal.svelte";
  import OutlineSidebar from "./OutlineSidebar.svelte";
  import PageControls from "./PageControls.svelte";
  import SearchSidebar from "./SearchSidebar.svelte";
  import TabBar from "./TabBar.svelte";
  import ThumbnailsSidebar from "./ThumbnailsSidebar.svelte";

  import { createPluginRegistration } from "@embedpdf/core";
  import { EmbedPDF } from "@embedpdf/core/svelte";
  import { usePdfiumEngine } from "@embedpdf/engines/svelte";
  import { ConsoleLogger } from "@embedpdf/models";
  import {
    AnnotationLayer,
    AnnotationPluginPackage,
  } from "@embedpdf/plugin-annotation/svelte";
  import {
    CapturePluginPackage,
    MarqueeCapture,
  } from "@embedpdf/plugin-capture/svelte";
  import { CommandsPluginPackage } from "@embedpdf/plugin-commands/svelte";
  import {
    DocumentContent,
    DocumentManagerPluginPackage,
    type InitialDocumentOptions,
  } from "@embedpdf/plugin-document-manager/svelte";
  import { ExportPluginPackage } from "@embedpdf/plugin-export/svelte";
  import { FullscreenPluginPackage } from "@embedpdf/plugin-fullscreen/svelte";
  import { HistoryPluginPackage } from "@embedpdf/plugin-history/svelte";
  import { I18nPluginPackage } from "@embedpdf/plugin-i18n/svelte";
  import {
    GlobalPointerProvider,
    InteractionManagerPluginPackage,
    PagePointerProvider,
  } from "@embedpdf/plugin-interaction-manager/svelte";
  import { PanPluginPackage } from "@embedpdf/plugin-pan/svelte";
  import { PrintPluginPackage } from "@embedpdf/plugin-print/svelte";
  import {
    RedactionLayer,
    RedactionPluginPackage,
  } from "@embedpdf/plugin-redaction/svelte";
  import {
    RenderLayer,
    RenderPluginPackage,
  } from "@embedpdf/plugin-render/svelte";
  import { Rotate, RotatePluginPackage } from "@embedpdf/plugin-rotate/svelte";
  import {
    Scroller,
    ScrollPluginPackage,
    ScrollStrategy,
  } from "@embedpdf/plugin-scroll/svelte";
  import {
    SearchLayer,
    SearchPluginPackage,
  } from "@embedpdf/plugin-search/svelte";
  import {
    SelectionLayer,
    SelectionPluginPackage,
  } from "@embedpdf/plugin-selection/svelte";
  import {
    SpreadMode,
    SpreadPluginPackage,
  } from "@embedpdf/plugin-spread/svelte";
  import { ThumbnailPluginPackage } from "@embedpdf/plugin-thumbnail/svelte";
  import {
    TilingLayer,
    TilingPluginPackage,
  } from "@embedpdf/plugin-tiling/svelte";
  import type { UIComponents } from "@embedpdf/plugin-ui/svelte";
  import {
    UIPluginPackage,
    UIProvider,
    useSchemaRenderer,
    useSelectionMenu,
  } from "@embedpdf/plugin-ui/svelte";
  import {
    Viewport,
    ViewportPluginPackage,
  } from "@embedpdf/plugin-viewport/svelte";
  import {
    MarqueeZoom,
    ZoomGestureWrapper,
    ZoomMode,
    ZoomPluginPackage,
  } from "@embedpdf/plugin-zoom/svelte";
  import LoadingSpinner from "./LoadingSpinner.svelte";
  import SchemaMenu from "./SchemaMenu.svelte";
  import SchemaModal from "./SchemaModal.svelte";
  import SchemaPanel from "./SchemaPanel.svelte";
  import SchemaSelectionMenu from "./SchemaSelectionMenu.svelte";
  import SchemaToolbar from "./SchemaToolbar.svelte";

  let { initialDocuments = $bindable<InitialDocumentOptions[]>([]) } = $props<{
    initialDocuments: InitialDocumentOptions[];
  }>();

  const logger = new ConsoleLogger();

  const pdfEngine = usePdfiumEngine({ logger });

  const uiComponents: UIComponents = {
    "zoom-toolbar": CustomZoomToolbar,
    "thumbnails-sidebar": ThumbnailsSidebar,
    "search-sidebar": SearchSidebar,
    "outline-sidebar": OutlineSidebar,
    "comment-sidebar": CommentSidebar,
    "link-modal": LinkModal,
  };

  const uiRenderers = {
    toolbar: SchemaToolbar,
    sidebar: SchemaPanel,
    menu: SchemaMenu,
    selectionMenu: SchemaSelectionMenu,
    modal: SchemaModal,
  };

  const plugins = [
    createPluginRegistration(DocumentManagerPluginPackage, {
      initialDocuments,
    }),
    createPluginRegistration(ViewportPluginPackage, { viewportGap: 10 }),
    createPluginRegistration(ScrollPluginPackage, {
      defaultStrategy: ScrollStrategy.Vertical,
    }),
    createPluginRegistration(InteractionManagerPluginPackage),
    createPluginRegistration(ZoomPluginPackage, {
      defaultZoomLevel: ZoomMode.FitPage,
    }),
    createPluginRegistration(PanPluginPackage),
    createPluginRegistration(SpreadPluginPackage, {
      defaultSpreadMode: SpreadMode.None,
    }),
    createPluginRegistration(RotatePluginPackage),
    createPluginRegistration(ExportPluginPackage),
    createPluginRegistration(PrintPluginPackage),
    createPluginRegistration(RenderPluginPackage),
    createPluginRegistration(TilingPluginPackage, {
      tileSize: 768,
      overlapPx: 2.5,
      extraRings: 0,
    }),
    createPluginRegistration(SelectionPluginPackage),
    createPluginRegistration(SearchPluginPackage),
    createPluginRegistration(CapturePluginPackage),
    createPluginRegistration(HistoryPluginPackage),
    createPluginRegistration(AnnotationPluginPackage),
    createPluginRegistration(FullscreenPluginPackage),
    createPluginRegistration(RedactionPluginPackage, {
      useAnnotationMode: true,
    }),
    createPluginRegistration(ThumbnailPluginPackage, {
      width: 120,
      paddingY: 10,
    }),
    createPluginRegistration(CommandsPluginPackage, { commands }),
    createPluginRegistration(I18nPluginPackage, {
      defaultLocale: "en",
      locales: [
        englishTranslations,
        germanTranslations,
        spanishTranslations,
        dutchTranslations,
      ],
      paramResolvers,
    }),
    createPluginRegistration(UIPluginPackage, {
      schema: viewerUISchema,
    }),
  ];

  async function handleInitialized() {}
</script>

{#if pdfEngine.error}
  <div class="flex h-full items-center justify-center bg-muted/30">
    <div
      class="max-w-sm rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-5"
    >
      <p class="text-sm font-medium text-destructive">
        {pdfEngine.error.message}
      </p>
    </div>
  </div>
{:else if pdfEngine.isLoading || !pdfEngine.engine}
  <div class="flex h-full items-center justify-center">
    <LoadingSpinner />
  </div>
{:else}
  <div class="flex h-full flex-1 flex-col overflow-hidden">
    <EmbedPDF
      engine={pdfEngine.engine}
      {logger}
      {plugins}
      onInitialized={handleInitialized}
    >
      {#snippet children({ pluginsReady, activeDocumentId, documentStates })}
        {#if pluginsReady}
          <div class="flex h-full flex-col">
            {#if activeDocumentId}
              <TabBar {documentStates} {activeDocumentId} />
              <UIProvider
                documentId={activeDocumentId}
                components={uiComponents}
                renderers={uiRenderers}
                class="flex min-h-0 flex-1 flex-col overflow-hidden"
              >
                {@render ViewerLayout({
                  documentId: activeDocumentId,
                })}
              </UIProvider>
            {:else}
              <EmptyState />
            {/if}
          </div>
        {:else}
          <div class="flex h-full items-center justify-center">
            <LoadingSpinner message="Initializing..." />
          </div>
        {/if}
      {/snippet}
    </EmbedPDF>
  </div>
{/if}

{#snippet ViewerLayout({ documentId }: { documentId: string })}
  {@const schemaRenderer = useSchemaRenderer(() => documentId)}
  {@const redactionMenu = useSelectionMenu("redaction", () => documentId)}
  {@const selectionMenu = useSelectionMenu("selection", () => documentId)}
  {@const annotationMenu = useSelectionMenu("annotation", () => documentId)}
  {@const groupAnnotationMenu = useSelectionMenu(
    "groupAnnotation",
    () => documentId,
  )}
  {@const modalInfo = schemaRenderer.getModalInfo()}
  {@const topMainToolbar = schemaRenderer.getToolbarInfo("top", "main")}
  {@const topSecondaryToolbar = schemaRenderer.getToolbarInfo(
    "top",
    "secondary",
  )}
  {@const leftMainSidebar = schemaRenderer.getSidebarInfo("left", "main")}
  {@const rightMainSidebar = schemaRenderer.getSidebarInfo("right", "main")}

  {#if topMainToolbar}
    {@const ToolbarRenderer = topMainToolbar.renderer}
    <ToolbarRenderer
      schema={topMainToolbar.schema}
      documentId={topMainToolbar.documentId}
      isOpen={topMainToolbar.isOpen}
      onClose={topMainToolbar.onClose}
    />
  {/if}

  {#if topSecondaryToolbar}
    {@const ToolbarRenderer = topSecondaryToolbar.renderer}
    <ToolbarRenderer
      schema={topSecondaryToolbar.schema}
      documentId={topSecondaryToolbar.documentId}
      isOpen={topSecondaryToolbar.isOpen}
      onClose={topSecondaryToolbar.onClose}
    />
  {/if}

  <div class="flex flex-1 overflow-hidden">
    {#if leftMainSidebar}
      {@const SidebarRenderer = leftMainSidebar.renderer}
      <SidebarRenderer
        schema={leftMainSidebar.schema}
        documentId={leftMainSidebar.documentId}
        isOpen={leftMainSidebar.isOpen}
        onClose={leftMainSidebar.onClose}
      />
    {/if}

    <div class="flex-1 overflow-hidden">
      <DocumentContent {documentId}>
        {#snippet children({ documentState, isLoading, isError, isLoaded })}
          {#if isLoading}
            <div class="flex h-full items-center justify-center">
              <LoadingSpinner message="Loading document..." />
            </div>
          {/if}
          {#if isError}
            <DocumentPasswordPrompt {documentState} />
          {/if}
          {#if isLoaded}
            <div class="relative h-full w-full">
              <GlobalPointerProvider {documentId}>
                <Viewport class="bg-muted/40" {documentId}>
                  <ZoomGestureWrapper {documentId}>
                    <Scroller {documentId}>
                      {#snippet renderPage(page)}
                        <Rotate
                          {documentId}
                          pageIndex={page.pageIndex}
                          style="background-color: #fff"
                        >
                          <PagePointerProvider
                            {documentId}
                            pageIndex={page.pageIndex}
                          >
                            <RenderLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                              scale={1}
                              style="pointer-events: none"
                            />
                            <TilingLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                              style="pointer-events: none"
                            />
                            <SearchLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                            />
                            <MarqueeZoom
                              {documentId}
                              pageIndex={page.pageIndex}
                            />
                            <MarqueeCapture
                              {documentId}
                              pageIndex={page.pageIndex}
                            />
                            <RedactionLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                              selectionMenu={redactionMenu.renderFn}
                            />
                            <SelectionLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                              selectionMenu={selectionMenu.renderFn}
                            />
                            <AnnotationLayer
                              {documentId}
                              pageIndex={page.pageIndex}
                              selectionMenu={annotationMenu.renderFn}
                              groupSelectionMenu={groupAnnotationMenu.renderFn}
                            />
                          </PagePointerProvider>
                        </Rotate>
                      {/snippet}
                    </Scroller>
                  </ZoomGestureWrapper>
                  <PageControls {documentId} />
                </Viewport>
              </GlobalPointerProvider>
            </div>
          {/if}
        {/snippet}
      </DocumentContent>
    </div>

    {#if rightMainSidebar}
      {@const SidebarRenderer = rightMainSidebar.renderer}
      <SidebarRenderer
        schema={rightMainSidebar.schema}
        documentId={rightMainSidebar.documentId}
        isOpen={rightMainSidebar.isOpen}
        onClose={rightMainSidebar.onClose}
      />
    {/if}
  </div>

  {#if modalInfo}
    {@const ModalRenderer = modalInfo.renderer}
    <ModalRenderer
      schema={modalInfo.schema}
      documentId={modalInfo.documentId}
      isOpen={modalInfo.isOpen}
      onClose={modalInfo.onClose}
      onExited={modalInfo.onExited}
    />
  {/if}
{/snippet}
