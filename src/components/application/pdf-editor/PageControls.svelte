<script lang="ts">
    import { Button } from "$components/ui/button";
    import { Input } from "$components/ui/input";
    import { useViewportCapability } from "@embedpdf/plugin-viewport/svelte";
    import { useScroll } from "@embedpdf/plugin-scroll/svelte";
    import { ChevronLeftIcon, ChevronRightIcon } from "@lucide/svelte";

    interface PageControlsProps {
        documentId: string;
    }

    let { documentId }: PageControlsProps = $props();

    const viewport = useViewportCapability();
    const scroll = useScroll(() => documentId);

    let isVisible = $state(false);
    let isHovering = $state(false);
    let hideTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let inputValue = $state("1");

    $effect(() => {
        inputValue = scroll.state.currentPage.toString();
    });

    const startHideTimer = () => {
        if (hideTimeoutId) clearTimeout(hideTimeoutId);
        hideTimeoutId = setTimeout(() => {
            if (!isHovering) isVisible = false;
        }, 3000);
    };

    $effect(() => {
        if (!viewport.provides) return;

        const unsubscribe = viewport.provides.onScrollActivity((activity) => {
            if (activity.documentId === documentId) {
                isVisible = true;
                startHideTimer();
            }
        });

        return () => {
            if (hideTimeoutId) clearTimeout(hideTimeoutId);
            unsubscribe?.();
        };
    });

    const handlePageSubmit = (e: Event) => {
        e.preventDefault();
        const page = parseInt(inputValue);
        if (!isNaN(page) && page >= 1 && page <= scroll.state.totalPages) {
            scroll.provides?.scrollToPage?.({ pageNumber: page });
        }
    };

    const handleInputChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        inputValue = target.value.replace(/[^0-9]/g, "");
    };
</script>

<div
    role="toolbar"
    aria-label="Page navigation"
    tabindex="-1"
    class="pointer-events-auto absolute bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-200"
    style="opacity: {isVisible ? 1 : 0}; transform: translateX(-50%) translateY({isVisible ? '0' : '4px'})"
    onmouseenter={() => {
        isHovering = true;
        isVisible = true;
    }}
    onmouseleave={() => {
        isHovering = false;
        startHideTimer();
    }}
>
    <div
        class="flex items-center gap-0.5 rounded-lg border border-border bg-background/95 p-0.5 shadow-lg backdrop-blur-sm"
    >
        <Button
            variant="ghost"
            size="icon-sm"
            onclick={() => {
                if (scroll.state.currentPage > 1)
                    scroll.provides?.scrollToPage?.({
                        pageNumber: scroll.state.currentPage - 1,
                    });
            }}
            disabled={scroll.state.currentPage === 1}
        >
            <ChevronLeftIcon class="size-4" />
        </Button>

        <form onsubmit={handlePageSubmit} class="flex items-center gap-1">
            <Input
                type="text"
                name="page"
                value={inputValue}
                oninput={handleInputChange}
                class="h-7 w-9 px-0 text-center text-xs tabular-nums"
            />
            <span class="pr-1 text-xs text-muted-foreground">
                / {scroll.state.totalPages}
            </span>
        </form>

        <Button
            variant="ghost"
            size="icon-sm"
            onclick={() => {
                if (scroll.state.currentPage < scroll.state.totalPages)
                    scroll.provides?.scrollToPage?.({
                        pageNumber: scroll.state.currentPage + 1,
                    });
            }}
            disabled={scroll.state.currentPage === scroll.state.totalPages}
        >
            <ChevronRightIcon class="size-4" />
        </Button>
    </div>
</div>
