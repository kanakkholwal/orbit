<script lang="ts">
  import { page } from "$app/state";
  import ShareButton from "$components/application/ShareButton.svelte";
  import SearchTrigger from "$components/layout/SearchTrigger.svelte";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { canInstallNatively, promptInstall } from "$lib/pwa.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import type { ToolConfig } from "$tools/list";
  import {
    IconAdjustmentsHorizontal as Adjustments,
    IconCompass as Compass,
    IconDownload as Download,
    IconHome as Home,
    IconLayoutSidebar as PanelIcon,
    IconSettings as SettingsIcon,
    IconShare as Share,
  } from "$lib/icons";
  import { toast } from "svelte-sonner";

  let {
    tool,
    wide,
    inlineSidebar,
    sidebarOpen,
  }: { tool: ToolConfig | null; wide: boolean; inlineSidebar: boolean; sidebarOpen: boolean } = $props();

  const installable = $derived(!appState.isTauri && canInstallNatively());

  async function install() {
    const result = await promptInstall();
    if (result === "accepted") toast.success(`${config.appName} is installed. Open it from your apps anytime, even offline.`);
  }

  const path = $derived(page.url.pathname);
  const category = $derived(tool ? toolsCategories.find((c) => c.id === tool.category)?.name : null);
  const place = $derived(
    path.startsWith("/explore")
      ? { title: "Explore tools", icon: Compass }
      : path.startsWith("/settings")
        ? { title: "Settings", icon: SettingsIcon }
        : path.startsWith("/open")
          ? { title: "Open files", icon: Compass }
          : { title: "Home", icon: Home }
  );
</script>

<header class="flex h-14 shrink-0 items-center gap-2 bg-background px-3 md:px-6" style="padding-top: env(safe-area-inset-top);">
  <a href="/" aria-label={`${config.appName} home`} class="grid size-11 shrink-0 place-items-center max-[360px]:hidden sm:size-9 md:hidden">
    <Logo markOnly size="xs" class="h-6 text-foreground" />
  </a>

  {#if !sidebarOpen}
    <Button
      variant="ghost"
      size="icon"
      class="shrink-0 rounded-full max-md:hidden"
      aria-label={inlineSidebar ? "Show sidebar" : "Open menu"}
      onclick={() => workspace.togglePanel(inlineSidebar)}
    >
      <PanelIcon />
    </Button>
  {/if}

  <div class="flex min-w-0 flex-1 items-center">
    {#if tool}
      <!-- The full breadcrumb lives in the page header; this compact title appears once it scrolls away. -->
      <span
        class={cn(
          "flex min-w-0 items-center gap-2 text-sm transition-[opacity,translate] duration-(--duration-base) ease-(--ease-ui-out) motion-reduce:transition-none",
          workspace.headerInView ? "pointer-events-none translate-y-1 opacity-0" : "translate-y-0 opacity-100"
        )}
        aria-hidden={workspace.headerInView}
      >
        <tool.icon class="size-4 shrink-0 text-primary" />
        <span class="truncate font-medium text-foreground">{tool.title}</span>
        {#if category}<span class="hidden shrink-0 text-muted-foreground sm:inline">in {category}</span>{/if}
      </span>
    {:else}
      <place.icon class="mr-2 hidden size-4 text-muted-foreground sm:block" />
      <span class="truncate text-sm font-medium text-foreground">{place.title}</span>
    {/if}
  </div>

  <div class="flex shrink-0 items-center justify-end gap-1.5">
    {#if !sidebarOpen}
      <SearchTrigger class="hidden w-56 lg:flex xl:w-72" />
    {/if}
    {#if workspace.inspector && !wide}
      <Button variant="outline" size="sm" class="rounded-full" onclick={() => (workspace.inspectorDrawerOpen = true)}>
        <Adjustments />
        {workspace.inspector.title}
      </Button>
    {/if}
    {#if installable}
      <Button variant="outline" size="sm" class="rounded-full" onclick={install} aria-label={`Install ${config.appName}`} title="Install as an app that works offline">
        <Download />
        <span class="hidden sm:inline">Install</span>
      </Button>
    {/if}
    {#if tool}
      <ShareButton
        data={{ title: tool.title, text: `Try ${tool.title} on ${config.appName}`, url: page.url.href }}
        variant="ghost"
        size="icon"
        class="rounded-full bg-muted/60 hover:bg-muted max-[360px]:hidden"
      >
        <Share class="size-4" />
        <span class="sr-only">Share</span>
      </ShareButton>
    {/if}
    <ThemeToggle class={cn("bg-muted/60 hover:bg-muted", sidebarOpen && "md:hidden")} />
  </div>
</header>
