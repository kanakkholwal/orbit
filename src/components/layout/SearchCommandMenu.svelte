<script lang="ts">
  import { goto, onNavigate } from "$app/navigation";
  import * as Drawer from "$components/ui/drawer";
  import {
    Command as CommandRoot,
    CommandBar,
    CommandFilter,
    CommandFilters,
    CommandFooter,
    CommandHint,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from "$components/ui/command";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";
  import { recentTools } from "$lib/runtime/recent-tools.svelte";
  import { Button } from "$components/ui/button";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import { getTool, toolList } from "$tools/list";
  import {
    IconBug as BugIcon,
    IconCompass as Compass,
    IconFileText as FileText,
    IconBrandGithub as Github,
    IconHome as HomeIcon,
    IconHistory as Clock,
    IconSearch as Search,
    IconLayoutGrid as AllIcon,
    IconLink as LinkIcon,
  } from "$lib/icons";
  import type { Icon } from "$lib/icons";
  import { onMount } from "svelte";

  type Command = {
    id: string;
    title: string;
    description?: string;
    category: string;
    icon: Icon;
    keywords?: string[];
    action: () => void;
  };

  const isMobile = new IsMobile();

  let query = $state("");

  const close = () => {
    workspace.searchOpen = false;
    query = "";
  };

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

  type Scope = "all" | "tools" | "pages" | "links";
  let scope = $state<Scope>("all");

  const scopeOf = (cmd: Command): Scope =>
    cmd.category === "Go to" ? "pages" : cmd.category === "Links" ? "links" : "tools";

  const groups = $derived.by(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of commands) {
      if (scope !== "all" && scopeOf(cmd) !== scope) continue;
      const list = map.get(cmd.category) ?? [];
      list.push(cmd);
      map.set(cmd.category, list);
    }
    return [...map].map(([name, items]) => ({ name, items }));
  });

  // With nothing typed, the tools you used last come first.
  const recentGroup = $derived.by(() => {
    if (query.trim() || scope !== "all") return null;
    const items: Command[] = recentTools.items
      .map((r) => getTool(r.slug))
      .filter((tool) => tool !== null)
      .slice(0, 4)
      .map((tool) => ({
        id: `recent:${tool.slug}`,
        title: tool.title,
        description: "Recently used",
        category: "Recent",
        icon: tool.icon || Clock,
        keywords: [],
        action: () => goto(`/tools/${tool.slug}`),
      }));
    return items.length > 0 ? { name: "Recent", items } : null;
  });

  function run(cmd: Command) {
    cmd.action();
    close();
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      workspace.searchOpen = !workspace.searchOpen;
    }
  }

  onMount(() => {
    window.addEventListener("keydown", handleGlobalKeydown);
    return () => window.removeEventListener("keydown", handleGlobalKeydown);
  });

  onNavigate(() => {
    close();
  });
</script>

{#snippet palette(phone: boolean)}
  <!-- Typing in the field bubbles up here, which is how the empty-query state is known. -->
  <div
    class="contents"
    role="presentation"
    oninput={(e) => {
      if (e.target instanceof HTMLInputElement) query = e.target.value;
    }}
  >
  <CommandRoot variant={phone ? "spotlight" : undefined} class={phone ? "flex h-full min-h-0 flex-col" : undefined}>
    {#if phone}
      <div class="flex shrink-0 items-center justify-between px-3 pb-1">
        <h2 class="text-base font-medium text-foreground">Search</h2>
        <Button variant="ghost" size="sm" onclick={close}>Close</Button>
      </div>
    {/if}
    <CommandBar>
      <CommandInput
        placeholder={phone ? "Search tools and pages" : `Search ${toolList.length} tools and pages`}
        hint={phone ? undefined : "Ctrl K"}
      />
      <CommandFilters bind:value={scope} label="Show">
        <CommandFilter value="all" label="Everything"><AllIcon /></CommandFilter>
        <CommandFilter value="tools" label="Tools"><FileText /></CommandFilter>
        <CommandFilter value="pages" label="Pages"><Compass /></CommandFilter>
        <CommandFilter value="links" label="Links"><LinkIcon /></CommandFilter>
      </CommandFilters>
    </CommandBar>
    <CommandList>
      <CommandEmpty>Nothing matches that.</CommandEmpty>
      {#each recentGroup ? [recentGroup, ...groups] : groups as group (group.name)}
        <CommandGroup heading={group.name}>
          {#each group.items as cmd (cmd.id)}
            <CommandItem
              value={cmd.id.startsWith("recent:") ? `recent ${cmd.title}` : cmd.title}
              keywords={[cmd.description ?? "", ...(cmd.keywords ?? [])].join(" ")}
              onSelect={() => run(cmd)}
            >
              <cmd.icon />
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate">{cmd.title}</span>
                {#if cmd.description}
                  <span class="truncate text-xs text-muted-foreground">{cmd.description}</span>
                {/if}
              </span>
            </CommandItem>
          {/each}
        </CommandGroup>
      {/each}
    </CommandList>
    {#if !phone}
      <CommandFooter>
        <span class="flex items-center gap-4">
          <CommandHint keys={["↑", "↓"]}>Move</CommandHint>
          <CommandHint keys={["↵"]}>Open</CommandHint>
        </span>
        <CommandHint keys={["Esc"]}>Close</CommandHint>
      </CommandFooter>
    {/if}
  </CommandRoot>
  </div>
{/snippet}

{#if isMobile.current}
  <Drawer.Root bind:open={workspace.searchOpen} shouldScaleBackground={false}>
    <Drawer.Content class="h-[92dvh] max-h-[92dvh] rounded-t-2xl">
      <Drawer.Title class="sr-only">Search</Drawer.Title>
      {@render palette(true)}
    </Drawer.Content>
  </Drawer.Root>
{:else}
  <CommandDialog bind:open={workspace.searchOpen} label="Search" variant="launcher">
    {@render palette(false)}
  </CommandDialog>
{/if}
