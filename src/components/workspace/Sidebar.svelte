<script lang="ts">
  import { page } from "$app/state";
  import SearchTrigger from "$components/layout/SearchTrigger.svelte";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { HoverCard, HoverCardContent, HoverCardTrigger } from "$components/ui/hover-card";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import {
    IconArrowRight as ArrowRight,
    IconBrandGithub as Github,
    IconChevronRight as Chevron,
    IconCompass as Compass,
    IconDownload as Download,
    IconFileUpload as FileUp,
    IconHeart as Heart,
    IconHome as Home,
    IconLayoutSidebar as PanelIcon,
    IconSettings as SettingsIcon,
    type Icon,
  } from "$lib/icons";
  import { recentTools } from "$lib/runtime/recent-tools.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import { getTool } from "$tools/list";

  let {
    mode = "inline",
    onnavigate,
    class: className,
  }: { mode?: "inline" | "drawer" | "sheet"; onnavigate?: () => void; class?: string } = $props();

  const path = $derived(page.url.pathname);
  const exploring = $derived(path.startsWith("/explore"));
  const exploreGroup = $derived(page.url.searchParams.get("category"));
  /** The group of the tool on screen, so the sidebar always shows where you are. */
  const toolGroup = $derived(path.startsWith("/tools/") ? getTool(path.slice(7))?.category : undefined);
  const total = $derived(toolsCategories.reduce((sum, c) => sum + (c.tools?.length ?? 0), 0));

  type Category = (typeof toolsCategories)[number];
  type Item = {
    key: string;
    href: string;
    label: string;
    icon: Icon;
    count?: number;
    active: boolean;
    external?: boolean;
    hidden?: boolean;
    /** Shows this group's tools in a flyout on hover or focus. */
    group?: Category;
  };

  const navigation = $derived<Item[]>([
    { key: "home", href: "/home", label: "Home", icon: Home, active: path === "/home" },
    { key: "explore", href: "/explore", label: "All tools", icon: Compass, count: total, active: exploring && !exploreGroup },
  ]);

  const groups = $derived<Item[]>(
    toolsCategories.map((c) => ({
      key: c.id,
      href: `/explore?category=${c.id}`,
      label: c.name,
      icon: c.icon,
      count: c.tools?.length ?? 0,
      active: (exploring && exploreGroup === c.id) || toolGroup === c.id,
      group: c,
    }))
  );

  const recent = $derived<Item[]>(
    recentTools.items
      .map((r) => getTool(r.slug))
      .filter((t) => t !== null)
      .slice(0, 4)
      .map((t) => ({ key: `recent-${t.slug}`, href: `/tools/${t.slug}`, label: t.title, icon: t.icon, active: false }))
  );

  const more = $derived<Item[]>([
    { key: "open", href: "/open", label: "Open a file", icon: FileUp, active: path.startsWith("/open") },
    { key: "settings", href: "/settings", label: "Settings", icon: SettingsIcon, active: path.startsWith("/settings") },
    { key: "app", href: "/download", label: "Get the desktop app", icon: Download, active: path.startsWith("/download"), hidden: appState.isTauri },
    { key: "sponsor", href: config.sponsor, label: "Sponsor", icon: Heart, active: false, external: true },
    { key: "github", href: config.github, label: "GitHub", icon: Github, active: false, external: true },
  ]);

  // One flyout at a time: moving to the next group closes the previous one at once, with no delay.
  let flyout = $state<string | null>(null);

  // One pill follows the pointer or keyboard focus from row to row.
  let wrap = $state<HTMLElement>();
  let pill = $state({ y: 0, h: 0, show: false });

  function track(event: Event) {
    const row = (event.target as HTMLElement).closest<HTMLElement>("[data-row]");
    if (!row) return;
    pill = { y: row.offsetTop, h: row.offsetHeight, show: true };
  }

  function arrowKeys(event: KeyboardEvent) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || !wrap) return;
    const rows = [...wrap.querySelectorAll<HTMLElement>("[data-row]")];
    const at = rows.indexOf(document.activeElement as HTMLElement);
    if (at === -1 && event.key.startsWith("Arrow") === false) return;
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : event.key === "ArrowDown" ? Math.min(at + 1, rows.length - 1) : Math.max(at - 1, 0);
    rows[next]?.focus();
    event.preventDefault();
  }

  const row =
    "relative z-[1] flex h-8 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-foreground/80 outline-none transition-[color,scale] duration-(--duration-fast) hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring active:scale-[var(--press-scale-row)] pointer-coarse:h-11 motion-reduce:transition-none " +
    "before:absolute before:left-0 before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:scale-y-0 before:rounded-full before:bg-primary before:transition-transform before:duration-(--duration-base) before:ease-(--ease-ui-out) motion-reduce:before:transition-none";
  const rowActive = "bg-foreground/[0.06] font-medium text-foreground before:scale-y-100";
  const eyebrow = "px-2 pb-1.5 pt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground";
</script>

{#snippet inner(item: Item)}
  <item.icon class={cn("size-4 shrink-0 transition-colors duration-(--duration-fast)", item.active ? "text-primary" : "text-muted-foreground")} />
  <span class="min-w-0 flex-1 truncate text-left">{item.label}</span>
  {#if item.group}
    <Chevron class="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity duration-(--duration-fast) group-hover/row:opacity-100 group-focus-visible/row:opacity-100 pointer-coarse:hidden" />
  {:else if item.external}
    <ArrowRight class="size-3.5 shrink-0 -rotate-45 text-muted-foreground opacity-0 transition-opacity duration-(--duration-fast) group-hover/row:opacity-100 pointer-coarse:hidden" />
  {/if}
  {#if item.count !== undefined}
    <span class="text-xs font-normal tabular-nums text-muted-foreground">{item.count}</span>
  {/if}
{/snippet}

{#snippet list(items: Item[])}
  <ul class="flex flex-col gap-0.5">
    {#each items.filter((i) => !i.hidden) as item (item.key)}
      <li>
        {#if item.group}
          {@const group = item.group}
          <HoverCard
            openDelay={flyout ? 0 : 160}
            closeDelay={80}
            open={flyout === item.key}
            onOpenChange={(next) => {
              if (next) flyout = item.key;
              else if (flyout === item.key) flyout = null;
            }}
          >
            <HoverCardTrigger
              href={item.href}
              data-row
              onclick={onnavigate}
              aria-current={item.active ? "page" : undefined}
              class={cn("group/row", row, item.active && rowActive)}
            >
              {@render inner(item)}
            </HoverCardTrigger>
            <HoverCardContent side="right" align="start" sideOffset={10} class="hidden w-64 p-1.5 pointer-fine:block">
              <div class="px-2 pb-1.5 pt-1">
                <p class="text-sm font-medium text-foreground">{group.name}</p>
                <p class="text-xs text-muted-foreground">{group.description}</p>
              </div>
              <ul class="no-scrollbar flex max-h-72 flex-col gap-0.5 overflow-y-auto">
                {#each group.tools ?? [] as tool (tool.slug)}
                  <li>
                    <a
                      href={`/tools/${tool.slug}`}
                      onclick={onnavigate}
                      class="flex h-8 items-center gap-2.5 rounded-lg px-2 text-sm text-foreground/80 outline-none transition-colors duration-(--duration-fast) hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <tool.icon class="size-4 shrink-0 text-muted-foreground" />
                      <span class="min-w-0 flex-1 truncate">{tool.title}</span>
                      {#if tool.isNew}<span class="size-1.5 shrink-0 rounded-full bg-success" title="New"></span>{/if}
                    </a>
                  </li>
                {/each}
              </ul>
            </HoverCardContent>
          </HoverCard>
        {:else}
          <a
            href={item.href}
            data-row
            onclick={onnavigate}
            aria-current={item.active ? "page" : undefined}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            class={cn("group/row", row, item.active && rowActive)}
          >
            {@render inner(item)}
          </a>
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

{#if mode === "sheet"}
  <!-- Phone launcher: the tab bar already has Home, Explore, Search and Settings, so this only browses tools. -->
  <div class={cn("flex min-h-0 flex-col bg-card", className)}>
    <div class="shrink-0 px-5 pb-3 pt-1">
      <h2 class="text-lg font-medium text-foreground">Browse tools</h2>
      <p class="text-sm text-muted-foreground">Pick a type, or open one you used before.</p>
    </div>

    <div class="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
      <ul class="grid grid-cols-2 gap-2">
        {#each groups as item (item.key)}
          <li>
            <a
              href={item.href}
              onclick={onnavigate}
              aria-current={item.active ? "page" : undefined}
              class={cn(
                "flex min-h-[4.5rem] flex-col justify-between gap-3 rounded-xl border bg-background p-3 outline-none transition-[border-color,scale] duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-row)",
                item.active ? "border-primary" : "border-border"
              )}
            >
              <item.icon class={cn("size-5", item.active ? "text-primary" : "text-muted-foreground")} />
              <span class="flex items-baseline justify-between gap-2">
                <span class="min-w-0 text-sm font-medium leading-tight text-foreground">{item.label}</span>
                <span class="shrink-0 text-xs tabular-nums text-muted-foreground">{item.count}</span>
              </span>
            </a>
          </li>
        {/each}
      </ul>

      {#if recent.length > 0}
        <h3 class={eyebrow}>Recent</h3>
        {@render list(recent)}
      {/if}

      <h3 class={eyebrow}>More</h3>
      {@render list(more.filter((i) => i.key !== "settings"))}
    </div>

    <div class="flex shrink-0 items-center justify-between border-t border-border py-2 pl-5 pr-3" style="padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);">
      <span class="text-xs text-muted-foreground">Runs on your device</span>
      <ThemeToggle />
    </div>
  </div>
{:else}
<div class={cn("flex h-full min-h-0 flex-col bg-card", className)}>
  {#if mode === "inline"}
    <div class="flex h-12 shrink-0 items-center justify-between border-b border-border pl-4 pr-2">
      <a href="/home" aria-label={`${config.appName} home`} class="rounded-md outline-none transition-opacity duration-(--duration-fast) hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring">
        <Logo size="sm" class="text-foreground" />
      </a>
      <Button variant="ghost" size="icon-sm" aria-label="Hide sidebar" onclick={() => workspace.togglePanel(true)}>
        <PanelIcon />
      </Button>
    </div>
  {/if}

  <div class="shrink-0 px-3 pt-3">
    <SearchTrigger class="w-full" />
  </div>

  <nav aria-label="Main" class="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
    <div
      bind:this={wrap}
      class="relative"
      role="presentation"
      onpointerover={track}
      onfocusin={track}
      onpointerleave={() => (pill.show = false)}
      onfocusout={() => (pill.show = false)}
      onkeydown={arrowKeys}
    >
      <span
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-foreground/[0.05] transition-[translate,height,opacity] duration-(--duration-dropdown) ease-(--ease-ui-out) pointer-coarse:hidden motion-reduce:transition-none"
        style="translate: 0 {pill.y}px; height: {pill.h}px; opacity: {pill.show ? 1 : 0};"
      ></span>

      <h2 class={cn(eyebrow, "pt-4")}>Navigation</h2>
      {@render list(navigation)}

      <h2 class={eyebrow}>Tools</h2>
      {@render list(groups)}

      {#if recent.length > 0}
        <h2 class={eyebrow}>Recent</h2>
        {@render list(recent)}
      {/if}

      <h2 class={eyebrow}>More</h2>
      {@render list(more)}
    </div>
  </nav>

  <div
    class="flex shrink-0 items-center justify-between border-t border-border py-2 pl-4 pr-2"
    style="padding-bottom: max(env(safe-area-inset-bottom), 0.5rem);"
  >
    <span class="text-xs text-muted-foreground">Runs on your device</span>
    <ThemeToggle />
  </div>
</div>
{/if}
