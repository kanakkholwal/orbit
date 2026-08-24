<script lang="ts">
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconCopy as Copy, IconMinus as Minus, IconSquare as Square, IconX as X } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  // Custom window chrome for the frameless Tauri window (decorations: false).
  // Renders nothing on web. The bar is a `data-tauri-drag-region` so the user
  // can drag the window from any empty part of it; the control buttons are
  // normal children and stay clickable.

  let win = $state<{
    minimize: () => Promise<void>;
    toggleMaximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  } | null>(null);
  let isMaximized = $state(false);

  onMount(() => {
    if (!appState.isTauri) return;
    let unlisten: (() => void) | undefined;

    (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const w = getCurrentWindow();
        win = w;
        isMaximized = await w.isMaximized();
        unlisten = await w.onResized(async () => {
          isMaximized = await w.isMaximized();
        });
      } catch (e) {
        console.error("TitleBar: failed to init window controls", e);
      }
    })();

    return () => unlisten?.();
  });

  const ctrl =
    "inline-flex h-8 w-12 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none";
</script>

{#if appState.isTauri}
  <header
    data-tauri-drag-region
    class="flex h-8 shrink-0 select-none items-center justify-between border-b border-border bg-background-inset/80 pl-3 backdrop-blur-xl"
  >
    <!-- <div data-tauri-drag-region class="flex items-center gap-2">
      <Logo size="sm" />
    </div> -->

    <span
      data-tauri-drag-region
      class="pointer-events-none absolute left-1/2 -translate-x-1/2 label-eyebrow text-muted-foreground"
    >
      {config.appName}
    </span>

    <div class="flex items-center ml-auto">
      <button
        type="button"
        class={ctrl}
        onclick={() => win?.minimize()}
        aria-label="Minimize"
      >
        <Minus class="size-3.5" />
      </button>
      <button
        type="button"
        class={ctrl}
        onclick={() => win?.toggleMaximize()}
        aria-label={isMaximized ? "Restore" : "Maximize"}
      >
        {#if isMaximized}
          <Copy class="size-3" />
        {:else}
          <Square class="size-3" />
        {/if}
      </button>
      <button
        type="button"
        class={cn(ctrl, "hover:bg-destructive hover:text-white")}
        onclick={() => win?.close()}
        aria-label="Close"
      >
        <X class="size-3.5" />
      </button>
    </div>
  </header>
{/if}
