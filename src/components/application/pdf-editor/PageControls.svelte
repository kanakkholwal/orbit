<script lang="ts">
  import { cn } from "$lib/utils";
  import { useScroll } from "@embedpdf/plugin-scroll/svelte";
  import { useViewportCapability } from "@embedpdf/plugin-viewport/svelte";
  import { IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight } from "@tabler/icons-svelte";
  import { chromeButton, chromeFloating } from "./chrome";

  interface PageControlsProps {
    documentId: string;
  }

  let { documentId }: PageControlsProps = $props();

  const viewport = useViewportCapability();
  const scroll = useScroll(() => documentId);

  let isVisible = $state(false);
  let isHovering = $state(false);
  let hasFocus = $state(false);
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let inputValue = $state("1");

  const currentPage = $derived(scroll.state.currentPage);
  const totalPages = $derived(scroll.state.totalPages);

  $effect(() => {
    inputValue = currentPage.toString();
  });

  function scheduleHide() {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (!isHovering && !hasFocus) isVisible = false;
    }, 2500);
  }

  $effect(() => {
    if (!viewport.provides) return;
    const unsubscribe = viewport.provides.onScrollActivity((activity) => {
      if (activity.documentId !== documentId) return;
      isVisible = true;
      scheduleHide();
    });
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      unsubscribe?.();
    };
  });

  const goTo = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) scroll.provides?.scrollToPage?.({ pageNumber });
  };
</script>

<div
  role="toolbar"
  aria-label="Page navigation"
  tabindex="-1"
  class={cn(
    "pointer-events-auto absolute bottom-4 left-1/2 z-40 -translate-x-1/2 transition-[opacity,translate] duration-200 ease-craft motion-reduce:transition-none",
    isVisible || hasFocus ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
  )}
  onpointerenter={() => {
    isHovering = true;
    isVisible = true;
  }}
  onpointerleave={() => {
    isHovering = false;
    scheduleHide();
  }}
  onfocusin={() => (hasFocus = true)}
  onfocusout={() => {
    hasFocus = false;
    scheduleHide();
  }}
>
  <div class="{chromeFloating} flex items-center gap-1 p-1">
    <button
      type="button"
      aria-label="Previous page"
      class={chromeButton({ state: currentPage <= 1 ? "disabled" : "idle" })}
      disabled={currentPage <= 1}
      onclick={() => goTo(currentPage - 1)}
    >
      <ChevronLeft class="size-4" />
    </button>

    <form
      class="flex items-center gap-1.5 px-0.5"
      onsubmit={(e) => {
        e.preventDefault();
        goTo(Number.parseInt(inputValue, 10));
      }}
    >
      <input
        type="text"
        name="page"
        inputmode="numeric"
        aria-label={`Page number, 1 to ${totalPages}`}
        value={inputValue}
        oninput={(e) => (inputValue = e.currentTarget.value.replace(/[^0-9]/g, ""))}
        onblur={() => (inputValue = currentPage.toString())}
        class="h-9 w-11 rounded-lg border border-border bg-background text-center text-body tabular-nums text-foreground outline-none transition-colors duration-150 focus:border-ring"
      />
      <span class="whitespace-nowrap pr-1 text-body tabular-nums text-muted-foreground">of {totalPages}</span>
    </form>

    <button
      type="button"
      aria-label="Next page"
      class={chromeButton({ state: currentPage >= totalPages ? "disabled" : "idle" })}
      disabled={currentPage >= totalPages}
      onclick={() => goTo(currentPage + 1)}
    >
      <ChevronRight class="size-4" />
    </button>
  </div>
</div>
