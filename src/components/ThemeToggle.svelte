<script lang="ts">
  import { Button } from "$components/ui/button";
  import { getTauriTheme } from "$lib/runtime/isTauri";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { Monitor, Moon, Sun } from "@lucide/svelte";
  import { DropdownMenu } from "bits-ui";
  import { resetMode, setMode } from "mode-watcher";

  let { class: className, variant = "ghost" } = $props<{class?: string, variant?: string}>();

  async function setSystemMode() {
    try {
      if (appState.isTauri) {
        const theme = await getTauriTheme();
        if (theme) {
          setMode(theme);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    resetMode();
  }
</script>

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    {#snippet child({ props })}
      <Button
        variant={variant as any}
        size="icon"
        class={cn("size-9 rounded-full text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        <Sun
          size={18}
          class="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
        />
        <Moon
          size={18}
          class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    {/snippet}
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    class="z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 outline-none"
    align="end"
  >
    <DropdownMenu.Item
      onclick={() => setMode("light")}
      class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <Sun size={14} />
      <span>Light</span>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={() => setMode("dark")}
      class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <Moon size={14} />
      <span>Dark</span>
    </DropdownMenu.Item>
    <DropdownMenu.Item
      onclick={setSystemMode}
      class="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
    >
      <Monitor size={14} />
      <span>System</span>
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
