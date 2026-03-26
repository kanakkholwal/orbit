<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import {
    ChevronRight,
    Compass,
    DownloadIcon,
    FileArchiveIcon,
    Github,
    LayoutGrid,
    Menu,
    MonitorDown,
    X
  } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let isMobileOpen = $state(false);
  let scrollY = $state(0);

  let isTauri = $derived(appState.isTauri);
  // We can treat mounted as true or derive from somewhere else if needed, but appState should be enough
  let mounted = $state(true); 

  // Essential Web Navigation Links
  const navLinks = [
    { name: "Tools", href: "/#tools", icon: LayoutGrid },
    { name: "Explore", href: "/explore", icon: Compass },
    { name: "Docs", href: "/docs", icon: FileArchiveIcon },
    // { name: "Download", href: "/download", icon: MonitorDown },
  ];
</script>

<svelte:window bind:scrollY />

{#if mounted}
  {#if isTauri}
    <header
      class="flex h-14 w-full items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-2xl px-4 supports-backdrop-filter:bg-card/60"
      data-tauri-drag-region
    >
      <div class="flex items-center gap-4 pointer-events-none">
        <a
          href="/"
          class="pointer-events-auto flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo />
        </a>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle class="size-8" />
      </div>
    </header>
  {:else}
    <header
      class="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-500"
      class:pt-3={scrollY > 20}
    >
      <div
        class={cn(
          "relative w-full max-w-5xl bg-card/70 backdrop-blur-xl transition-all duration-500 ring-1 ring-border/50",
          isMobileOpen ? "rounded-2xl shadow-lg bg-card/90" : "rounded-2xl",
          scrollY > 20 && !isMobileOpen ? "shadow-md bg-card/85" : "shadow-sm",
        )}
      >
        <div class="flex h-14 items-center justify-between px-3 sm:px-4">
          <div class="flex flex-1 items-center">
            <a
              href="/"
              class="flex items-center gap-2.5 group ml-2 transition-transform active:scale-95"
            >
              <Logo />
            </a>
          </div>

          <nav class="hidden md:flex items-center gap-1 justify-center flex-1">
            {#each navLinks as item}
              <a
                href={item.href}
                class="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                {item.name}
              </a>
            {/each}
          </nav>

          <div class="flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
            <a
              href={config.github}
              target="_blank"
              rel="noopener noreferrer"
              class="hidden sm:flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title="GitHub Repository"
            >
              <Github size={18} />
            </a>

            <ThemeToggle class="hidden sm:inline-flex" />

            <div class="hidden md:block h-4 w-px bg-border mx-1"></div>

            <Button
              href="/download"
              variant="dark"
              size="sm"
              class="hidden sm:inline-flex rounded-full px-5! font-semibold shadow-sm"
            >
              <DownloadIcon size={14} />
              Download
            </Button>

            <button
              class="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary md:hidden focus:outline-none transition-colors"
              onclick={() => (isMobileOpen = !isMobileOpen)}
              aria-label="Toggle Menu"
            >
              {#if !isMobileOpen}
                <Menu size={20} />
              {:else}
                <X size={20} />
              {/if}
            </button>
          </div>
        </div>

        {#if isMobileOpen}
          <div class="overflow-hidden rounded-b-2xl">

          <div
            transition:slide={{ duration: 300, easing: cubicOut, axis: "y" }}
            class="border-t border-border/40 px-4 pb-6 pt-2 md:hidden bg-card/50 backdrop-blur-md"
          >
            <nav class="flex flex-col gap-1">
              {#each navLinks as item}
                <a
                  href={item.href}
                  class="flex items-center rounded-xl px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors group"
                  onclick={() => (isMobileOpen = false)}
                >
                  {#if item.icon}
                    <item.icon
                      size={18}
                      class="mr-3 text-primary/70 group-hover:text-primary transition-colors"
                    />
                  {/if}
                  <span class="flex-1">{item.name}</span>
                  <ChevronRight
                    size={16}
                    class="opacity-40 group-hover:translate-x-1 transition-transform"
                  />
                </a>
              {/each}

              <div class="my-2 h-px w-full bg-border/40"></div>

              <a
                href={config.github}
                target="_blank"
                class="flex items-center rounded-xl px-4 py-3.5 text-sm font-semibold text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors group"
                onclick={() => (isMobileOpen = false)}
              >
                <Github size={18} class="mr-3" />
                <span class="flex-1">Open Source</span>
                <ChevronRight
                  size={16}
                  class="opacity-40 group-hover:translate-x-1 transition-transform"
                />
              </a>
            </nav>

            <div
              class="mt-4 flex items-center justify-between px-4 py-4 border-y border-border/40"
            >
              <span class="text-sm font-medium text-foreground"
                >Theme Preference</span
              >
              <ThemeToggle />
            </div>

            <div class="mt-6 flex flex-col gap-3">
              <Button
                href="/download"
                variant="outline"
                class="w-full rounded-xl py-5 font-semibold text-foreground border-border/60"
                onclick={() => (isMobileOpen = false)}
              >
                <MonitorDown size={18} class="mr-2 text-muted-foreground" />
                Download App
              </Button>
              <Button
                href="/#tools"
                variant="dark"
                class="w-full rounded-xl py-5 font-semibold shadow-md"
                onclick={() => (isMobileOpen = false)}
              >
                Use Web Tools
              </Button>
            </div>
          </div>
          </div>
        {/if}
      </div>
    </header>
  {/if}
{/if}
