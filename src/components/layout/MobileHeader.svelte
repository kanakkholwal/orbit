<script lang="ts">
  import { Button } from "$components/ui/button";
  import { Trigger as SidebarTrigger } from "$components/ui/sidebar";
  import { Command, Moon, Sun } from "@lucide/svelte";
  import { mode, toggleMode } from "mode-watcher";
</script>

<header
  class="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-card/80 px-4 backdrop-blur-md md:hidden"
>
  <div class="flex items-center gap-2">
    <div
      class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
    >
      <Command size={18} />
    </div>
    <span class="text-base font-bold tracking-tight">NexoPDF</span>
  </div>
  <div>
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


