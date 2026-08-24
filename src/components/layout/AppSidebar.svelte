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
    IconBrandGithub as GithubIcon,
    IconCompass as Compass,
    IconDownload as DownloadIcon,
    IconHome as HomeIcon,
    IconSearch as Search,
    IconStar as Star,
  } from "@tabler/icons-svelte";
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
    "group/item relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-sm transition-[background-color,color,box-shadow] duration-200 ease-snappy group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:size-9 group-data-[state=collapsed]:gap-0";
</script>

<Sidebar.Root
  collapsible="icon"
  class="border-r border-sidebar-border/80 bg-sidebar"
>
  <Sidebar.Rail />

  <Sidebar.Header
    class="gap-4 border-b border-sidebar-border/80 px-4 pb-4 pt-[max(env(safe-area-inset-top),1rem)] group-data-[state=collapsed]:items-center group-data-[state=collapsed]:px-2"
  >
    <div class="flex w-full items-start justify-between gap-2">
      <a
        href="/"
        class="group flex min-w-0 items-center gap-2 overflow-hidden rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${config.appName} home`}
      >
        <Logo size="md" textClassName="group-data-[state=collapsed]:hidden" />
      </a>
      <div class="flex items-center gap-1 group-data-[state=collapsed]:hidden">
        <ThemeToggle class="size-8 rounded-md border border-sidebar-border/70 bg-transparent" />
      </div>
    </div>

    <div class="hidden px-0.5 group-data-[state=collapsed]:block">
      <span class="label-eyebrow text-muted-foreground">
        Index
      </span>
    </div>

    <div class="group-data-[state=collapsed]:hidden">
      <SearchCommandMenu />
    </div>

    <button
      type="button"
      onclick={() => sidebar.toggle()}
      aria-label="Open command menu"
      title="Search (Ctrl/Cmd K)"
      class="hidden size-9 items-center justify-center rounded-md border border-sidebar-border/70 bg-transparent text-muted-foreground transition-colors hover:bg-card/50 hover:text-foreground group-data-[state=collapsed]:inline-flex"
    >
      <Search class="size-4" />
    </button>

    {#if !isTauri}
      <a
        href="/download"
        class="hidden items-center gap-2 px-1 text-xs text-muted-foreground transition-colors hover:text-foreground group-data-[state=collapsed]:hidden lg:inline-flex"
      >
        <DownloadIcon class="size-3.5 text-primary" />
        Download desktop app
      </a>
      <a
        href="/download"
        title="Download the desktop app"
        class="hidden size-9 items-center justify-center rounded-md border border-sidebar-border/70 bg-transparent text-primary transition-colors hover:bg-card/50 group-data-[state=collapsed]:inline-flex"
      >
        <DownloadIcon class="size-3.5" />
      </a>
    {/if}
  </Sidebar.Header>

  <Sidebar.Content
    class="scrollbar-hide gap-5 px-3 py-5 group-data-[state=collapsed]:items-center"
  >
    <section class="flex flex-col gap-2">
      <div class="px-1 group-data-[state=collapsed]:hidden">
        <span class="label-eyebrow text-muted-foreground">
          Browse
        </span>
      </div>

      <nav class="flex flex-col gap-1" aria-label="Primary">
        <div class="flex flex-col gap-1">
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
                  ? "bg-card font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
              )}
            >
              <item.icon
                class={cn(
                  "size-4 shrink-0",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span class="flex-1 group-data-[state=collapsed]:hidden">
                {item.label}
              </span>
            </a>
          {/each}
        </div>
      </nav>
    </section>

    <section class="flex flex-col gap-2">
      <div
        class="flex items-center justify-between px-1 group-data-[state=collapsed]:hidden"
      >
        <span class="label-eyebrow text-muted-foreground">
          Categories
        </span>
        <span class="font-mono text-caption text-muted-foreground">
          {String(toolsCategories.length).padStart(2, "0")}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        {#each toolsCategories as cat (cat.id)}
          {@const isOpen = openGroups[cat.id]}
          <div class="flex w-full flex-col gap-1">
            <button
              type="button"
              onclick={() => (openGroups[cat.id] = !openGroups[cat.id])}
              aria-expanded={isOpen}
              aria-controls={`group-${cat.id}`}
              class="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-card/40 hover:text-foreground group-data-[state=collapsed]:hidden"
            >
              <span class="label-eyebrow text-muted-foreground">
                {cat.name}
              </span>
              <span
                class="font-mono text-caption tabular-nums text-muted-foreground"
              >
                {String(cat.tools?.length ?? 0).padStart(2, "0")}
              </span>
            </button>

            <div
              class="mx-auto hidden h-px w-4 bg-sidebar-border group-data-[state=collapsed]:block"
              aria-hidden="true"
            ></div>

            {#if isOpen || sidebar.state === "collapsed"}
              <ul
                id={`group-${cat.id}`}
                class="flex flex-col gap-1"
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
                          ? "bg-card font-medium text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                      )}
                    >
                      {#if tool.icon}
                        {@const Icon = tool.icon}
                        <Icon
                          class={cn(
                            "size-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        />
                      {/if}
                      <span
                        class="flex-1 truncate group-data-[state=collapsed]:hidden"
                      >
                        {tool.title}
                      </span>
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  </Sidebar.Content>

  <Sidebar.Footer
    class="gap-0 border-t border-sidebar-border/80 px-4 pb-[max(env(safe-area-inset-bottom),0.9rem)] pt-4 group-data-[state=collapsed]:hidden"
  >
    <div class="flex flex-col gap-3 px-1">
      <a
        href={config.github}
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center justify-between rounded-lg border border-sidebar-border/70 bg-card/50 px-3 py-2.5 transition-colors hover:bg-card"
      >
        <span class="flex items-center gap-2.5">
          <GithubIcon class="size-4 text-muted-foreground" />
          <span class="text-sm text-foreground">Star on GitHub</span>
        </span>
        <Star
          class="size-4 text-muted-foreground transition-colors group-hover:text-primary"
        />
      </a>
      <div class="flex items-center justify-between gap-2">
        <p class="label-eyebrow text-muted-foreground">
          v{config.appVersion} · GPL-3.0
        </p>
        <a
          href="/changelog"
          class="label-eyebrow text-muted-foreground transition-colors hover:text-primary"
        >
          Changelog
        </a>
      </div>
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
