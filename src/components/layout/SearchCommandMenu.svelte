<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import * as Drawer from "$components/ui/drawer";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import { toolList } from "$tools/list";
  import {
    IconBug as BugIcon,
    IconChevronRight as ChevronRight,
    IconCompass as Compass,
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

  const isMobile = new IsMobile();

  let query = $state("");
  let selectedIndex = $state(0);
  let inputRef = $state<HTMLInputElement>();

  const close = () => (workspace.searchOpen = false);

  async function openExternal(url: string) {
    if (appState.isTauri) {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      openUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  const categoryName = (id: string) => toolsCategories.find((c) => c.id === id)?.name ?? id;

  const commands: Command[] = [
    ...toolList.map((tool) => ({
      id: `tool:${tool.slug}`,
      title: tool.title,
      description: `${tool.description.split(". ")[0]}.`,
      category: categoryName(tool.category),
      icon: tool.icon || FileText,
      keywords: [tool.title, ...(tool.keywords || [])],
      action: () => goto(`/tools/${tool.slug}`),
    })),
    {
      id: "nav:home",
      title: "Home",
      description: "Your workspace and recent tools.",
      category: "Go to",
      icon: HomeIcon,
      keywords: ["home", "workspace", "start"],
      action: () => goto("/home"),
    },
    {
      id: "nav:explore",
      title: "Explore tools",
      description: "Browse every tool by category.",
      category: "Go to",
      icon: Compass,
      keywords: ["explore", "browse", "library"],
      action: () => goto("/explore"),
    },
    {
      id: "nav:docs",
      title: "Documentation",
      description: "Install, tools and FAQ.",
      category: "Go to",
      icon: FileText,
      keywords: ["docs", "help", "guide"],
      action: () => goto("/docs"),
    },
    {
      id: "ext:github",
      title: "View on GitHub",
      description: "Open the source code.",
      category: "Links",
      icon: Github,
      keywords: ["github", "source", "repository"],
      action: () => openExternal(config.github),
    },
    {
      id: "ext:bug",
      title: "Report a problem",
      description: "Open an issue on GitHub.",
      category: "Links",
      icon: BugIcon,
      keywords: ["bug", "issue", "report", "feedback"],
      action: () => openExternal(`${config.github}/issues/new`),
    },
  ];

  const normalizedQuery = $derived(query.trim().toLowerCase());

  const results = $derived(
    !normalizedQuery
      ? commands
      : commands.filter((cmd) =>
          [cmd.title, cmd.description ?? "", ...(cmd.keywords ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
  );

  $effect(() => {
    void results;
    selectedIndex = 0;
  });

  const groupedResults = $derived.by(() => {
    const map = new Map<string, { cmd: Command; index: number }[]>();
    results.forEach((cmd, index) => {
      const list = map.get(cmd.category) ?? [];
      list.push({ cmd, index });
      map.set(cmd.category, list);
    });
    return [...map].map(([name, items]) => ({ name, items }));
  });

  function selectResult(cmd: Command) {
    cmd.action();
    close();
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      workspace.searchOpen = !workspace.searchOpen;
      return;
    }
    if (!workspace.searchOpen || results.length === 0) return;
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
    } else if (e.key === "Escape" && !isMobile.current) {
      e.preventDefault();
      close();
    }
  }

  $effect(() => {
    if (!workspace.searchOpen) {
      query = "";
      return;
    }
    if (isMobile.current || !inputRef) return;
    const id = requestAnimationFrame(() => inputRef?.focus());
    return () => cancelAnimationFrame(id);
  });

  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  });

  onNavigate(() => {
    close();
  });

  function highlight(text: string, search: string) {
    if (!search.trim()) return [{ text, hit: false }];
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text
      .split(new RegExp(`(${escaped})`, "gi"))
      .filter(Boolean)
      .map((part) => ({ text: part, hit: part.toLowerCase() === search.toLowerCase() }));
  }
</script>

{#snippet searchField(className = "")}
  <label class={cn("flex items-center gap-2.5 px-4", className)}>
    <Search class="size-4 shrink-0 text-muted-foreground" />
    <span class="sr-only">Search</span>
    <input
      bind:this={inputRef}
      bind:value={query}
      type="search"
      placeholder={`Search ${toolList.length} tools and pages`}
      class="h-12 w-full bg-transparent text-body-lg text-foreground placeholder:text-placeholder focus:outline-none"
    />
  </label>
{/snippet}

{#snippet resultList(className = "")}
  <div class={cn("overflow-y-auto overscroll-contain p-2", className)}>
    {#if results.length === 0}
      <div class="flex flex-col items-center gap-1 px-4 py-10 text-center">
        <p class="text-body font-medium text-foreground">No matches</p>
        <p class="text-body text-muted-foreground">Nothing matches “{query}”.</p>
      </div>
    {:else}
      {#each groupedResults as group (group.name)}
        <div class="flex flex-col pb-1">
          <div class="px-3 pb-1 pt-2 text-caption font-medium text-muted-foreground">{group.name}</div>
          <ul class="flex flex-col gap-0.5">
            {#each group.items as { cmd, index } (cmd.id)}
              {@const isSelected = index === selectedIndex}
              <li>
                <button
                  type="button"
                  onclick={() => selectResult(cmd)}
                  onmouseenter={() => (selectedIndex = index)}
                  class={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                    isSelected ? "bg-muted" : "hover:bg-muted"
                  )}
                >
                  <span
                    class={cn(
                      "grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <cmd.icon class="size-4" />
                  </span>
                  <span class="flex min-w-0 flex-1 flex-col">
                    <span class="truncate text-body font-medium text-foreground">
                      {#each highlight(cmd.title, query) as part, i (i)}
                        {#if part.hit}<span class="text-primary">{part.text}</span>{:else}{part.text}{/if}
                      {/each}
                    </span>
                    {#if cmd.description}
                      <span class="truncate text-caption text-muted-foreground">{cmd.description}</span>
                    {/if}
                  </span>
                  <ChevronRight
                    class={cn(
                      "size-4 shrink-0 text-muted-foreground transition-opacity",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    {/if}
  </div>
{/snippet}

{#if isMobile.current}
  <Drawer.Root bind:open={workspace.searchOpen} shouldScaleBackground={false}>
    <Drawer.Content class="h-[85dvh] max-h-[85dvh] rounded-t-3xl">
      <Drawer.Title class="sr-only">Search</Drawer.Title>
      {@render searchField("mx-3 mt-3 rounded-xl border border-border bg-card")}
      {@render resultList("min-h-0 flex-1 pb-[max(env(safe-area-inset-bottom),0.5rem)]")}
    </Drawer.Content>
  </Drawer.Root>
{:else if workspace.searchOpen}
  <div
    class="fixed inset-0 z-60 bg-background/60 backdrop-blur-sm"
    transition:fade={{ duration: 150 }}
    onclick={close}
    role="presentation"
  ></div>

  <div
    class="fixed inset-0 z-70 flex items-start justify-center px-4 pt-[14vh]"
    role="dialog"
    aria-modal="true"
    aria-label="Search"
    tabindex="-1"
    onclick={(e) => e.target === e.currentTarget && close()}
    onkeydown={(e) => e.key === "Escape" && close()}
  >
    <div
      class="flex max-h-[min(34rem,70vh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      transition:scale={{ duration: 200, start: 0.97, easing: cubicOut }}
    >
      {@render searchField("border-b border-border")}
      {@render resultList("min-h-0 flex-1")}
      <div class="flex items-center justify-between gap-2 border-t border-border bg-muted px-4 py-2 text-caption text-muted-foreground">
        <span class="flex items-center gap-3">
          <span class="inline-flex items-center gap-1.5">
            <kbd class="inline-grid h-5 min-w-5 place-items-center rounded-sm border border-border bg-background px-1">
              <CornerDownLeft class="size-3" />
            </kbd>
            Open
          </span>
          <span class="inline-flex items-center gap-1.5">
            <kbd class="inline-grid h-5 min-w-5 place-items-center rounded-sm border border-border bg-background px-1">↑</kbd>
            <kbd class="inline-grid h-5 min-w-5 place-items-center rounded-sm border border-border bg-background px-1">↓</kbd>
            Move
          </span>
        </span>
        <span class="tabular-nums">{results.length} results</span>
      </div>
    </div>
  </div>
{/if}
