<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { toolList } from "$tools/list";
  import {
    IconBug as BugIcon,
    IconChevronRight as ChevronRight,
    IconCornerDownLeft as CornerDownLeft,
    IconFileText as FileText,
    IconBrandGithub as Github,
    IconHome as HomeIcon,
    IconSearch as Search,
  } from "@tabler/icons-svelte";
  import { onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";

  type Command = {
    id: string;
    title: string;
    description?: string;
    category: string;
    icon: typeof FileText;
    keywords?: string[];
    action: () => void;
  };

  let { iconOnly = false } = $props<{ iconOnly?: boolean }>();
  let isTauri = $derived(appState.isTauri);

  let isOpen = $state(false);
  let query = $state("");
  let selectedIndex = $state(0);
  let inputRef = $state<HTMLInputElement>();
  let contentHeight = $state(0);

  function open() {
    isOpen = true;
  }
  function close() {
    isOpen = false;
  }

  async function openExternal(url: string) {
    if (isTauri) {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      openUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  function categoryName(id: string) {
    return toolsCategories.find((c) => c.id === id)?.name ?? id;
  }

  const commands: Command[] = [
    ...toolList.map((tool) => ({
      id: `tool:${tool.slug}`,
      title: tool.title,
      description: tool.description.split(". ")[0] + ".",
      category: categoryName(tool.category),
      icon: tool.icon || FileText,
      keywords: [tool.title, ...(tool.keywords || [])],
      action: () => goto(`/tools/${tool.slug}`),
    })),
    {
      id: "nav:home",
      title: "Home",
      description: "Back to the start.",
      category: "Navigation",
      icon: HomeIcon,
      keywords: ["home", "main", "start"],
      action: () => goto("/"),
    },
    {
      id: "nav:explore",
      title: "Explore tools",
      description: "Browse the full tool library.",
      category: "Navigation",
      icon: Search,
      keywords: ["explore", "browse", "library"],
      action: () => goto("/explore"),
    },
    {
      id: "nav:docs",
      title: "Documentation",
      description: "Setup, tools, and FAQ.",
      category: "Navigation",
      icon: FileText,
      keywords: ["docs", "help", "guide"],
      action: () => goto("/docs"),
    },
    {
      id: "nav:changelog",
      title: "Changelog",
      description: "Recent releases.",
      category: "Navigation",
      icon: FileText,
      keywords: ["changelog", "release", "what's new"],
      action: () => goto("/changelog"),
    },
    {
      id: "ext:github",
      title: "View on GitHub",
      description: "Open the source repository.",
      category: "External",
      icon: Github,
      keywords: ["github", "source", "repository"],
      action: () => openExternal(config.github),
    },
    {
      id: "ext:bug",
      title: "Report a bug",
      description: "Open an issue on GitHub.",
      category: "External",
      icon: BugIcon,
      keywords: ["bug", "issue", "report", "feedback"],
      action: () => openExternal(`${config.github}/issues/new`),
    },
  ];

  let normalizedQuery = $derived(query.trim().toLowerCase());

  let results = $derived(
    !normalizedQuery
      ? commands
      : commands.filter((cmd) => {
          const haystack = [
            cmd.title,
            cmd.description ?? "",
            cmd.id,
            ...(cmd.keywords ?? []),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        })
  );

  $effect(() => {
    void results;
    selectedIndex = 0;
  });

  let groupedResults = $derived.by(() => {
    const groups: { name: string; items: { cmd: Command; index: number }[] }[] = [];
    const map = new Map<string, { cmd: Command; index: number }[]>();
    results.forEach((cmd, index) => {
      const list = map.get(cmd.category) ?? [];
      list.push({ cmd, index });
      map.set(cmd.category, list);
    });
    map.forEach((items, name) => groups.push({ name, items }));
    return groups;
  });

  function selectResult(cmd: Command) {
    cmd.action();
    close();
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      isOpen ? close() : open();
      return;
    }
    if (!isOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % results.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + results.length) % results.length;
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[selectedIndex];
      if (target) selectResult(target);
    }
  }

  $effect(() => {
    if (isOpen && inputRef) {
      const id = requestAnimationFrame(() => inputRef?.focus());
      return () => cancelAnimationFrame(id);
    }
  });

  $effect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  });

  onNavigate(() => close());

  function highlight(text: string, search: string) {
    if (!search.trim()) return [{ text, hit: false }];
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text
      .split(regex)
      .filter(Boolean)
      .map((part) => ({
        text: part,
        hit: part.toLowerCase() === search.toLowerCase(),
      }));
  }
</script>

{#if iconOnly}
  <button
    type="button"
    onclick={open}
    aria-label="Open command menu"
    title="Open command menu (⌘K)"
    class="inline-flex size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
  >
    <Search class="size-4" />
  </button>
{:else}
  <button
    type="button"
    onclick={open}
    aria-label="Open command menu"
    title="Open command menu (⌘K)"
    class="group flex h-9 w-full items-center gap-2 rounded-sm border border-border/60 bg-background/40 px-3 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
  >
    <Search class="size-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
    <span class="flex-1 truncate label-eyebrow text-muted-foreground">
      Search…
    </span>
    <kbd
      class="hidden items-center gap-0.5 rounded-xs border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 sm:inline-flex"
    >
      ⌘K
    </kbd>
  </button>
{/if}

{#if isOpen}
  <div
    class="fixed inset-0 z-60 bg-background/70 backdrop-blur-md"
    transition:fade={{ duration: 160 }}
    onclick={close}
    onkeydown={(e) => e.key === "Escape" && close()}
    role="presentation"
  ></div>

  <div
    class="isolate fixed inset-0 z-100 flex items-start justify-center px-4 pt-[12vh]"
    role="dialog"
    aria-modal="true"
    aria-label="Command menu"
    tabindex="-1"
    onclick={(e) => e.target === e.currentTarget && close()}
    onkeydown={(e) => e.key === "Escape" && close()}
  >
    <div
      class="relative z-50 w-full max-w-xl transform-gpu overflow-hidden rounded-md border border-border/60 bg-card shadow-2xl"
      transition:scale={{ duration: 220, start: 0.96, easing: cubicOut }}
      onoutroend={() => {
        query = "";
        contentHeight = 0;
        selectedIndex = 0;
      }}
    >
      <div class="flex items-center gap-2 border-b border-border/60 px-3">
        <Search class="size-4 shrink-0 text-muted-foreground/70" />
        <input
          bind:this={inputRef}
          bind:value={query}
          type="search"
          placeholder={`Search ${toolList.length} tools, pages, and actions…`}
          aria-label="Search"
          class="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <kbd
          class="pointer-events-none hidden h-5 select-none items-center rounded-xs border border-border/60 bg-muted/60 px-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70 sm:inline-flex"
        >
          ESC
        </kbd>
      </div>

      <div
        class="overflow-hidden transition-[height] duration-300 ease-out"
        style="height: {contentHeight}px"
      >
        <div bind:clientHeight={contentHeight}>
          {#if results.length > 0}
            <div class="max-h-96 overflow-y-auto scrollbar-tranparent p-2">
              {#each groupedResults as group (group.name)}
                <div class="flex flex-col">
                  <div
                    class="px-3 pb-1.5 pt-2 label-eyebrow text-muted-foreground"
                  >
                    {group.name}
                  </div>
                  <ul class="flex flex-col gap-0.5">
                    {#each group.items as { cmd, index } (cmd.id)}
                      {@const isSelected = index === selectedIndex}
                      <li>
                        <button
                          type="button"
                          onclick={() => selectResult(cmd)}
                          onmouseenter={() => (selectedIndex = index)}
                          class={cn(
                            "group flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-primary/10 text-foreground"
                              : "text-foreground hover:bg-muted/60"
                          )}
                        >
                          <span
                            class={cn(
                              "inline-flex size-7 shrink-0 items-center justify-center rounded-sm transition-colors",
                              isSelected
                                ? "bg-primary/15 text-primary"
                                : "bg-muted/60 text-muted-foreground"
                            )}
                          >
                            <cmd.icon class="size-3.5" />
                          </span>

                          <span class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate text-sm font-medium text-foreground">
                              {#each highlight(cmd.title, query) as part, i (i)}
                                {#if part.hit}
                                  <span class="text-primary">{part.text}</span>
                                {:else}
                                  {part.text}
                                {/if}
                              {/each}
                            </span>
                            {#if cmd.description}
                              <span class="truncate text-xs text-muted-foreground">
                                {#each highlight(cmd.description, query) as part, i (i)}
                                  {#if part.hit}
                                    <span class="text-primary/80">{part.text}</span>
                                  {:else}
                                    {part.text}
                                  {/if}
                                {/each}
                              </span>
                            {/if}
                          </span>

                          <ChevronRight
                            class={cn(
                              "size-3.5 shrink-0 transition-all",
                              isSelected
                                ? "translate-x-0.5 text-primary opacity-100"
                                : "opacity-0 -translate-x-1"
                            )}
                          />
                        </button>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
          {:else if query}
            <div class="px-4 py-10 text-center">
              <p
                class="label-eyebrow text-muted-foreground"
              >
                No matches
              </p>
              <p class="mt-2 text-sm text-muted-foreground">
                Nothing for
                <span class="font-mono text-foreground">"{query}"</span>.
              </p>
            </div>
          {/if}
        </div>
      </div>

      <div
        class="flex w-full items-center justify-between gap-2 border-t border-border/60 bg-muted/30 px-3 py-2"
      >
        <div class="flex items-center gap-3 text-[11px] text-muted-foreground/70">
          <span class="inline-flex items-center gap-1.5">
            <kbd
              class="inline-flex h-4 select-none items-center rounded-xs border border-border/60 bg-background px-1 font-mono text-[10px]"
            >
              <CornerDownLeft class="size-2.5" />
            </kbd>
            <span class="label-eyebrow text-muted-foreground">Open</span>
          </span>
          <span class="inline-flex items-center gap-1.5">
            <kbd
              class="inline-flex h-4 select-none items-center rounded-xs border border-border/60 bg-background px-1 font-mono text-[10px]"
            >
              ↑
            </kbd>
            <kbd
              class="inline-flex h-4 select-none items-center rounded-xs border border-border/60 bg-background px-1 font-mono text-[10px]"
            >
              ↓
            </kbd>
            <span class="label-eyebrow text-muted-foreground">Navigate</span>
          </span>
        </div>
        <span
          class="label-eyebrow text-muted-foreground"
        >
          {results.length} / {commands.length}
        </span>
      </div>
    </div>
  </div>
{/if}
