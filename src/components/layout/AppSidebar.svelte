<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$components/Logo.svelte";
  import SearchCommandMenu from "$components/layout/SearchCommandMenu.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { toolsCategories } from "$constants/tools";
  import * as Sidebar from "$components/ui/sidebar";
  import { useSidebar } from "$components/ui/sidebar";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import {
    ArrowUpRight,
    Compass,
    DownloadIcon,
    GithubIcon,
    HomeIcon,
    Search,
  } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let currentPath = $derived(page.url.pathname);
  let isTauri = $derived(appState.isTauri);
  const sidebar = useSidebar();

  function isActive(path: string) {
    return currentPath === path || currentPath.startsWith(path + "/");
  }

  let openGroups = $state<Record<string, boolean>>(
    Object.fromEntries(toolsCategories.map((c) => [c.id, true]))
  );

  const primaryNav = [
    { label: "Home", href: "/home", icon: HomeIcon, exact: true },
    { label: "Explore", href: "/explore", icon: Compass },
  ];

  const navLink =
    "group/item relative flex min-h-9 items-center gap-3 rounded-sm px-3 text-sm font-medium transition-colors duration-200 active:scale-[0.99] group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:size-9 group-data-[state=collapsed]:gap-0";
</script>

<Sidebar.Root collapsible="icon" class="border-r border-border/60">
  <Sidebar.Rail />

  <Sidebar.Header
    class="gap-2 border-b border-border/60 px-3 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] group-data-[state=collapsed]:items-center group-data-[state=collapsed]:px-2"
  >
    <div class="flex w-full items-center justify-between gap-1">
      <a
        href="/"
        class="group flex items-center gap-2 overflow-hidden rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
        aria-label={`${config.appName} home`}
      >
        <Logo size="md" textClassName="group-data-[state=collapsed]:hidden" />
      </a>
      <div class="flex items-center gap-1 group-data-[state=collapsed]:hidden">
        <ThemeToggle class="size-8 rounded-sm" />
        <a
          href={config.github}
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex size-8 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="GitHub"
        >
          <GithubIcon class="size-4" />
        </a>
      </div>
    </div>

    <div class="group-data-[state=collapsed]:hidden">
      <SearchCommandMenu />
    </div>
    <button
      type="button"
      onclick={() => sidebar.toggle()}
      aria-label="Open command menu"
      title="Search (⌘K)"
      class="hidden size-9 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground group-data-[state=collapsed]:inline-flex"
    >
      <Search class="size-4" />
    </button>

    {#if !isTauri}
      <a
        href="/download"
        class="group flex items-center justify-between gap-3 rounded-sm border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/10 group-data-[state=collapsed]:hidden"
      >
        <span class="flex items-center gap-2">
          <DownloadIcon class="size-3.5" />
          Get the desktop app
        </span>
        <ArrowUpRight
          class="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
      <a
        href="/download"
        title="Download the desktop app"
        class="hidden size-9 items-center justify-center rounded-sm border border-primary/20 bg-primary/5 text-primary transition-colors hover:bg-primary/10 group-data-[state=collapsed]:inline-flex"
      >
        <DownloadIcon class="size-3.5" />
      </a>
    {/if}
  </Sidebar.Header>

  <Sidebar.Content class="scrollbar-hide gap-1 px-2 py-3 group-data-[state=collapsed]:items-center">
    <nav class="flex flex-col gap-0.5" aria-label="Primary">
      {#each primaryNav as item (item.href)}
        {@const active = item.exact
          ? currentPath === item.href
          : isActive(item.href)}
        <a
          href={item.href}
          aria-current={active ? "page" : undefined}
          title={item.label}
          class={cn(
            navLink,
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <item.icon
            class={cn(
              "size-4 shrink-0",
              active ? "text-primary" : "text-muted-foreground/70"
            )}
          />
          <span class="flex-1 group-data-[state=collapsed]:hidden">
            {item.label}
          </span>
        </a>
      {/each}
    </nav>

    <div class="my-3 h-px w-full bg-border/60"></div>

    {#each toolsCategories as cat (cat.id)}
      {@const isOpen = openGroups[cat.id]}
      <div class="flex w-full flex-col gap-1">
        <button
          type="button"
          onclick={() => (openGroups[cat.id] = !openGroups[cat.id])}
          aria-expanded={isOpen}
          aria-controls={`group-${cat.id}`}
          class="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors hover:text-foreground group-data-[state=collapsed]:hidden"
        >
          <span
            class="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70"
          >
            {cat.name}
          </span>
          <span
            class="font-mono text-[10px] tabular-nums text-muted-foreground/50"
          >
            {String(cat.tools?.length ?? 0).padStart(2, "0")}
          </span>
        </button>

        <div
          class="hidden h-px w-5 bg-border/60 group-data-[state=collapsed]:block"
          aria-hidden="true"
        ></div>

        {#if isOpen || sidebar.state === "collapsed"}
          <ul
            id={`group-${cat.id}`}
            class="flex flex-col gap-0.5"
            transition:slide={{ duration: 220, easing: cubicOut, axis: "y" }}
          >
            {#each cat.tools ?? [] as tool (tool.slug)}
              {@const active = isActive(`/tools/${tool.slug}`)}
              <li>
                <a
                  href={`/tools/${tool.slug}`}
                  aria-current={active ? "page" : undefined}
                  title={tool.title}
                  class={cn(
                    navLink,
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {#if active}
                    <span
                      class="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary group-data-[state=collapsed]:hidden"
                      aria-hidden="true"
                    ></span>
                  {/if}
                  {#if tool.icon}
                    {@const Icon = tool.icon}
                    <Icon
                      class={cn(
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground/70"
                      )}
                    />
                  {/if}
                  <span class="flex-1 truncate group-data-[state=collapsed]:hidden">
                    {tool.title}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </Sidebar.Content>

  <Sidebar.Footer
    class="gap-0 border-t border-border/60 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 group-data-[state=collapsed]:hidden"
  >
    <div class="flex items-center justify-between gap-2">
      <p
        class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60"
      >
        v{config.appVersion} · GPL-3.0
      </p>
      <a
        href="/changelog"
        class="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        Changelog
      </a>
    </div>
  </Sidebar.Footer>
</Sidebar.Root>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
