<script lang="ts">
  import { page } from "$app/state";
  import Button from "$components/ui/button/button.svelte";
  import * as Sidebar from "$components/ui/sidebar";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import {
    Chromium,
    Command,
    GithubIcon,
    Moon,
    Star,
    Sun,
  } from "@lucide/svelte";
  import { mode, toggleMode } from "mode-watcher";
  // Derived state for reactivity
  let currentPath = $derived(page.url.pathname);

  // Helper for active state checking
  function isActive(path: string) {
    return currentPath.startsWith(path);
  }
</script>

<Sidebar.Root
  class="hidden w-70 flex-col border-r border-border bg-sidebar backdrop-blur-xl md:flex"
>
  <Sidebar.Rail class="data-[state=collapsed]:hidden" />
  <Sidebar.Header>
    <Sidebar.MenuItem>
      <div
        class="inline-flex w-full items-center justify-between gap-2 hover:bg-transparent py-2"
      >
        <a
          href="/"
          class="group flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div
            class="relative flex group-data-[collapsible=icon]:w-(--sidebar-width-icon) size-8! items-center justify-center rounded-lg bg-primary/10 shadow-inner ring-1 ring-primary/20 transition-all group-hover:bg-primary/20"
          >
            <Command class="h-4 w-4 text-primary" />
            <div
              class="absolute inset-0 rounded-lg bg-primary/20 blur opacity-0 transition-opacity group-hover:opacity-100"
            ></div>
          </div>
          <div class="flex flex-col group-data-[state=collapsed]:hidden">
            <span class="text-sm font-bold tracking-tight text-foreground"
              >{config.appName}</span
            >
            <span class="text-[10px] font-medium text-muted-foreground"
              >Pro Suite</span
            >
          </div>
        </a>
        <Button
          variant="ghost"
          size="icon"
          onclick={toggleMode}
          class="rounded-full hidden md:inline-flex group-data-[state=collapsed]:hidden"
        >
          {#if mode.current === "light"}
            <Sun size={16} />
          {:else}
            <Moon size={16} />
          {/if}
        </Button>
      </div>
    </Sidebar.MenuItem>
  </Sidebar.Header>
  <Sidebar.Content class="scrollbar-hide">
    <Sidebar.Group>
      <Sidebar.Menu>
        <Sidebar.MenuItem class="flex items-center gap-2 p-0">
          <Button
            variant="dark"
            href="/explore"
            class="flex-auto h-8 justify-start group-data-[state=collapsed]:hidden"
          >
            <Chromium size={16} />
            <span>Explore</span>
          </Button>
          <Button
            size="icon"
            class="size-8"
            variant="outline"
            target="_blank"
            href={config.github}
          >
            <GithubIcon />
            <span class="sr-only">Github</span>
          </Button>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Group>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each toolList as tool (tool.slug)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton tooltipContent={tool.title}>
                {#snippet child({ props })}
                  <a
                    href={`/tools/${tool.slug}`}
                    {...props}
                    class={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 border border-transparent",
                      isActive(`/tools/${tool.slug}`)
                        ? "bg-background shadow-sm text-foreground border-border/50 ring-1 ring-black/5"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      "group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:size-8",
                    )}
                  >
                    {#if tool.icon}
                      {@const Icon = tool.icon}
                      <Icon size={16} />
                    {/if}
                    <span class="group-data-[state=collapsed]:hidden"
                      >{tool.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer
    class="border-t border-border/40 p-4 group-data-[state=collapsed]:hidden"
  >
    <a
      href={config.github}
      target="_blank"
      class="relative overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-card to-muted/50 p-4 shadow-sm"
    >
      <div class="flex items-center gap-3">
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500"
        >
          <Star size={14} />
        </div>
        <div>
          <p class="text-xs font-semibold text-foreground">{config.appName}</p>
          <p class="text-[10px] text-muted-foreground">Star on GitHub!</p>
        </div>
      </div>
      <div
        class="pointer-events-none absolute -right-4 -top-4 h-16 w-16 bg-primary/10 blur-2xl"
      ></div>
    </a>
  </Sidebar.Footer>
</Sidebar.Root>

<style>
  /* Hide scrollbar for cleaner look */
  .scrollbar-hide {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
