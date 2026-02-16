<script lang="ts">
  import Button from "$components/ui/button/button.svelte";
  import { FileText, Github, Moon, Sun } from "@lucide/svelte";
  import { mode, toggleMode } from "mode-watcher";
  import { cubicOut } from "svelte/easing";
  import { slide } from "svelte/transition";

  let isMobileOpen = false;
  let scrollY = 0;

  // const navLinks = [
  //   { name: "Tools", href: "/#tools" },
  //   { name: "Privacy", href: "/privacy" },
  //   { name: "Pricing", href: "/pricing" },
  // ];
</script>

<svelte:window bind:scrollY />

<header class="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
  <div
    class="relative w-full max-w-5xl rounded-full border border-border/40 bg-background/60 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300"
    class:shadow-lg={scrollY > 20}
    class:shadow-sm={scrollY <= 20}
    class:bg-background={isMobileOpen} 
    class:rounded-2xl={isMobileOpen}
  >
    <div class="flex h-14 items-center justify-between px-2 pr-2 sm:px-4">
      
      <a href="/" class="flex items-center gap-2 pl-2 group">
        <div
          class="flex size-8 items-center justify-center rounded-xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-inner border border-white/10 dark:border-white/5 transition-transform group-hover:scale-105"
        >
          <FileText size={18} />
        </div>
        <span class="text-sm font-semibold tracking-tight text-foreground/90">
          Nexo PDF
        </span>
      </a>

      <!-- <nav class="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {#each navLinks as item}
          <a
            href={item.href}
            class="rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            {item.name}
          </a>
        {/each}
      </nav> -->

      <div class="flex items-center gap-1.5 sm:gap-2">
        <Button
          href="https://github.com/kanakkholwal/nexopdf"
          target="_blank"
          variant="ghost"
          size="icon"
          class="hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground sm:flex"
        >
          <Github size={18} />
        </Button>

        <Button
          onclick={toggleMode}
          variant="ghost"
          size="icon"
          class="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground transition-all hover:bg-secondary/80"
        >
          {#if mode.current === "light"}
            <Sun size={18} class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {:else}
            <Moon size={18} class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/if}
          <span class="sr-only">Toggle theme</span>
        </Button>

        <div class="mx-1 h-4 w-px bg-border/60 hidden sm:block"></div>

        <Button
          href="/#tools"
          size="sm"
          class="hidden h-9 rounded-full bg-foreground px-5 text-xs font-medium text-background hover:bg-foreground/90 shadow-md sm:inline-flex"
        >
          Get Started
        </Button>

        <button
          class="flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-secondary/80 md:hidden focus:outline-none"
          on:click={() => (isMobileOpen = !isMobileOpen)}
          aria-label="Toggle Menu"
        >
          <div class="relative h-4 w-4">
            <span 
              class="absolute left-0 top-1.5 h-0.5 w-4 rounded bg-current transition-all duration-300"
              class:rotate-45={isMobileOpen}
              class:top-2={isMobileOpen}
            ></span>
            <span 
              class="absolute left-0 bottom-1.5 h-0.5 w-4 rounded bg-current transition-all duration-300"
              class:-rotate-45={isMobileOpen}
              class:bottom-1.5={isMobileOpen}
            ></span>
          </div>
        </button>
      </div>
    </div>

    {#if isMobileOpen}
      <div
        transition:slide={{ duration: 300, easing: cubicOut, axis: 'y' }}
        class="border-t border-border/40 px-2 pb-4 md:hidden"
      >
        <div class="grid gap-1 p-2">
          <!-- {#each navLinks as item}
            <a
              href={item.href}
              class="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
              on:click={() => (isMobileOpen = false)}
            >
              {item.name}
              <ChevronRight size={14} class="opacity-50" />
            </a>
          {/each}
           -->
          <a
            href="https://github.com/kanakkholwal/nexopdf"
            target="_blank"
            class="flex items-center justify-between rounded-xl p-3 text-sm font-medium text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
          >
            GitHub
            <Github size={14} class="opacity-50" />
          </a>
        </div>

        <div class="mt-2 px-2">
          <a
            href="/#tools"
            class="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-transform active:scale-95"
            on:click={() => (isMobileOpen = false)}
          >
            Get Started
          </a>
        </div>
      </div>
    {/if}
  </div>
</header>