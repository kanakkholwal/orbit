<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import SearchCommandMenu from "$components/layout/SearchCommandMenu.svelte";
  import { Button } from "$components/ui/button";
  import { Trigger as SidebarTrigger } from "$components/ui/sidebar";
  import { Moon, Sun } from "@lucide/svelte";
  import { mode, toggleMode } from "mode-watcher";


</script>

<header
  class="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-card/80 px-4 backdrop-blur-md md:hidden"
>
  <a
    href="/"
    class="group flex items-center gap-3 transition-opacity hover:opacity-80"
  >
    <Logo size="md" />
  </a>
  <div class="inline-flex items-center gap-2">
  <SearchCommandMenu iconOnly />
    <Button
      variant="ghost"
      size="icon"
      onclick={toggleMode}
      class="rounded-full"
    >
      {#if mode.current === "light"}
        <Sun size={16} />
      {:else}
        <Moon size={16} />
      {/if}
    </Button>
    <SidebarTrigger />
  </div>
</header>
