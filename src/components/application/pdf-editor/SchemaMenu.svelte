<script lang="ts">
  import Icons from "$components/Icons.svelte";
  import * as Drawer from "$components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { cn } from "$lib/utils";
  import { useCommand } from "@embedpdf/plugin-commands/svelte";
  import { useTranslations } from "@embedpdf/plugin-i18n/svelte";
  import {
    type MenuItem,
    type MenuRendererProps,
    type MenuSchema,
    getUIItemProps,
    useUISchema,
  } from "@embedpdf/plugin-ui/svelte";
  import { IconCheck as Check, IconChevronLeft as ChevronLeft, IconChevronRight as ChevronRight } from "@tabler/icons-svelte";
  import { tick } from "svelte";
  import { chromeFloating } from "./chrome";

  let { schema, documentId, anchorEl, onClose }: MenuRendererProps = $props();

  type StackEntry = { schema: MenuSchema; title?: string };

  const uiSchema = useUISchema();
  const translations = useTranslations(() => documentId);
  const isMobile = new IsMobile();

  let stack = $state<StackEntry[]>([]);
  let menuRef = $state<HTMLDivElement | null>(null);
  let position = $state<{ top: number; left: number } | null>(null);

  $effect(() => {
    stack = [{ schema }];
  });

  const current = $derived(stack[stack.length - 1]);
  const labelOf = (item: { labelKey?: string; label?: string; id: string }) =>
    translations.translate(item.labelKey || item.id, { fallback: item.label || item.id });

  function openSubmenu(menuId: string, title: string) {
    const next = uiSchema?.schema?.menus[menuId];
    if (next) stack = [...stack, { schema: next, title }];
  }

  function back() {
    if (stack.length > 1) stack = stack.slice(0, -1);
  }

  const items = () => Array.from(menuRef?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);

  $effect(() => {
    if (!current || isMobile.current || !menuRef) return;
    tick().then(() => items()[0]?.focus({ preventScroll: true }));
  });

  $effect(() => {
    if (!anchorEl || isMobile.current || !menuRef) return;
    const menu = menuRef;
    const place = () => {
      const rect = anchorEl.getBoundingClientRect();
      const width = menu.offsetWidth || 220;
      const height = menu.offsetHeight || 0;
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
      const below = rect.bottom + 6;
      const top = below + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : below;
      position = { top, left };
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(menu);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  });

  $effect(() => {
    if (isMobile.current) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef?.contains(target) || anchorEl?.contains(target)) return;
      onClose();
    };
    const timer = setTimeout(() => document.addEventListener("pointerdown", outside));
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", outside);
    };
  });

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (stack.length > 1) back();
      else {
        onClose();
        anchorEl?.focus();
      }
      return;
    }
    if (event.key === "ArrowLeft" && stack.length > 1) {
      event.preventDefault();
      back();
      return;
    }
    const list = items();
    if (list.length === 0) return;
    const index = list.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      list[moves[event.key]]?.focus();
    }
  }

  const rowClass =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-body outline-none transition-colors duration-150 focus-visible:bg-muted";
</script>

{#snippet contents(mobile: boolean)}
  {#if stack.length > 1}
    <div class={cn("flex items-center gap-2 border-b border-border", mobile ? "px-3 pb-2" : "p-1")}>
      <button
        type="button"
        onclick={back}
        class={cn(rowClass, "w-auto gap-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground", mobile ? "h-11" : "h-9")}
      >
        <ChevronLeft class="size-4" />
        Back
      </button>
      {#if current?.title}
        <span class="ml-auto truncate pr-2.5 text-body font-medium text-foreground">{current.title}</span>
      {/if}
    </div>
  {/if}
  <div class={cn("flex flex-col gap-0.5", mobile ? "px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-1" : "p-1")}>
    {#each current?.schema.items ?? [] as item, index (`${item.type}-${index}`)}
      {@render menuItem(item, mobile)}
    {/each}
  </div>
{/snippet}

{#snippet menuItem(item: MenuItem, mobile: boolean)}
  {#if item.type === "command"}
    {@render commandItem(item, mobile)}
  {:else if item.type === "submenu"}
    <button
      {...getUIItemProps(item)}
      type="button"
      role="menuitem"
      aria-haspopup="menu"
      onclick={() => openSubmenu(item.menuId, labelOf(item))}
      onkeydown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          openSubmenu(item.menuId, labelOf(item));
        }
      }}
      class={cn(rowClass, "text-foreground hover:bg-muted/60", mobile ? "h-11" : "h-9")}
    >
      {#if item.icon}
        <Icons name={item.icon} class="size-4 shrink-0 text-muted-foreground" />
      {/if}
      <span class="min-w-0 flex-1 truncate">{labelOf(item)}</span>
      <ChevronRight class="size-4 shrink-0 text-muted-foreground" />
    </button>
  {:else if item.type === "divider"}
    <div {...getUIItemProps(item)} role="separator" class="mx-2 my-1 h-px bg-border"></div>
  {:else if item.type === "section"}
    <div {...getUIItemProps(item)} role="group" class="flex flex-col gap-0.5 py-1">
      {#if item.labelKey || item.label}
        <div class="px-2.5 pb-1 pt-1.5 text-caption font-medium text-muted-foreground">{labelOf(item)}</div>
      {/if}
      {#each item.items as subItem, index (`${subItem.type}-${index}`)}
        {@render menuItem(subItem, mobile)}
      {/each}
    </div>
  {/if}
{/snippet}

{#snippet commandItem(item: Extract<MenuItem, { type: "command" }>, mobile: boolean)}
  {@const command = useCommand(
    () => item.commandId,
    () => documentId
  )}
  {@const cmd = command?.current}
  {#if cmd?.visible}
    {@const iconProps = cmd.iconProps || {}}
    <button
      {...getUIItemProps(item)}
      type="button"
      role="menuitem"
      aria-current={cmd.active ? "true" : undefined}
      disabled={cmd.disabled}
      onclick={() => {
        if (cmd.disabled) return;
        cmd.execute();
        onClose();
      }}
      class={cn(
        rowClass,
        mobile ? "h-11" : "h-9",
        cmd.disabled ? "cursor-not-allowed text-placeholder" : "cursor-pointer text-foreground hover:bg-muted/60"
      )}
    >
      {#if cmd.icon}
        <Icons
          name={cmd.icon}
          class={cn("size-4 shrink-0", cmd.active ? "text-primary" : !cmd.disabled && "text-muted-foreground")}
          primaryColor={iconProps.primaryColor}
          secondaryColor={iconProps.secondaryColor}
        />
      {/if}
      <span class={cn("min-w-0 flex-1 truncate", cmd.active && "font-medium")}>{cmd.label}</span>
      {#if cmd.shortcuts?.length && !mobile}
        <kbd class="font-sans text-caption text-muted-foreground">{cmd.shortcuts[0]}</kbd>
      {/if}
      {#if cmd.active}
        <Check class="size-4 shrink-0 text-primary" />
      {/if}
    </button>
  {/if}
{/snippet}

{#if current}
  {#if isMobile.current}
    <Drawer.Root
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      direction="bottom"
      shouldScaleBackground={false}
    >
      <Drawer.Content class="max-h-[85dvh] rounded-t-3xl">
        <Drawer.Title class="sr-only">{current.title ?? "Menu"}</Drawer.Title>
        <div bind:this={menuRef} {...getUIItemProps(current.schema)} role="menu" class="scrollbar-subtle mt-3 overflow-y-auto">
          {@render contents(true)}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {:else}
    <div
      bind:this={menuRef}
      {...getUIItemProps(current.schema)}
      role="menu"
      tabindex="-1"
      onkeydown={onKeydown}
      class={cn(
        chromeFloating,
        "scrollbar-subtle fixed z-50 max-h-[min(32rem,calc(100dvh-1rem))] min-w-56 max-w-80 overflow-y-auto transition-opacity duration-150",
        position ? "opacity-100" : "opacity-0"
      )}
      style:top={position ? `${position.top}px` : "0px"}
      style:left={position ? `${position.left}px` : "0px"}
    >
      {@render contents(false)}
    </div>
  {/if}
{/if}
