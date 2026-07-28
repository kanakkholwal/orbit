<script lang="ts">
  import { Button } from "$components/ui/button";
  import { cn } from "$lib/utils";
  import { IconMoon as Moon, IconSun as Sun } from "@tabler/icons-svelte";
  import { mode, setMode } from "mode-watcher";

  let { class: className, variant = "ghost" } = $props<{
    class?: string;
    variant?: string;
  }>();

  let isDark = $derived(mode.current === "dark");

  function toggle() {
    setMode(isDark ? "light" : "dark");
  }
</script>

<Button
  type="button"
  onclick={toggle}
  variant={variant as any}
  size="icon"
  aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
  aria-pressed={isDark}
  title={isDark ? "Switch to light theme" : "Switch to dark theme"}
  class={cn(
    "relative size-9 rounded-full text-muted-foreground hover:text-foreground",
    className
  )}
>
  <Sun
    size={18}
    class="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
  />
  <Moon
    size={18}
    class="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
  />
  <span class="sr-only">Toggle theme</span>
</Button>
