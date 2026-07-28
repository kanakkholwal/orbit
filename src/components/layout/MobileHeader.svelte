<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import SearchCommandMenu from "$components/layout/SearchCommandMenu.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Trigger as SidebarTrigger } from "$components/ui/sidebar";
  import { config } from "$constants/app";
</script>

<header
  class="sticky top-0 z-50 flex w-full flex-col border-b border-border/60 bg-card/70 backdrop-blur-lg backdrop-saturate-150 supports-backdrop-filter:bg-card/55 md:hidden"
  style="padding-top: max(env(safe-area-inset-top), 0.25rem);"
>
  <div class="flex h-12 items-center justify-between gap-2 px-3">
    <a
      href="/"
      class="flex items-center gap-2 rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      aria-label={`${config.appName} home`}
    >
      <Logo size="md" />
    </a>

    <div class="flex items-center gap-1">
      <SearchCommandMenu iconOnly />
      <ThemeToggle class="size-9 rounded-sm" />
      <SidebarTrigger
        class="inline-flex size-9 items-center justify-center rounded-sm text-foreground transition-colors hover:bg-muted/60"
      />
    </div>
  </div>
</header>
