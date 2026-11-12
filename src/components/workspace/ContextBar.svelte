<script lang="ts">
  import { page } from "$app/state";
  import ShareButton from "$components/application/ShareButton.svelte";
  import SearchTrigger from "$components/layout/SearchTrigger.svelte";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "$components/ui/breadcrumb";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { canInstallNatively, promptInstall } from "$lib/pwa.svelte";
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

<header
  class="flex min-h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-3 md:px-4"
  style="padding-top: env(safe-area-inset-top);"
>
  <a href="/" aria-label={`${config.appName} home`} class="grid size-11 shrink-0 place-items-center max-[360px]:hidden sm:size-9 md:hidden">
    <Logo markOnly size="xs" class="h-6 text-foreground" />
  </a>

  {#if !sidebarOpen}
    <Button
      variant="ghost"
      size="icon"
      class="shrink-0 max-md:hidden"
      aria-label={inlineSidebar ? "Show sidebar" : "Open menu"}
      onclick={() => workspace.togglePanel(inlineSidebar)}
    >
      <PanelIcon />
    </Button>
  {/if}

  <div class="flex min-w-0 flex-1 items-center">
    {#if tool}
      <Breadcrumb class="min-w-0">
        <BreadcrumbList class="flex-nowrap">
          <BreadcrumbItem class="hidden sm:inline-flex">
            <BreadcrumbLink href="/explore">Tools</BreadcrumbLink>
          </BreadcrumbItem>
          {#if category}
            <BreadcrumbSeparator class="hidden sm:flex" />
            <BreadcrumbItem class="hidden md:inline-flex">
              <BreadcrumbLink href={`/explore?category=${tool.category}`}>{category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator class="hidden md:flex" />
          {/if}
          <BreadcrumbItem class="min-w-0">
            <BreadcrumbPage class="truncate" title={tool.title}>{tool.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
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
      <Button variant="outline" size="sm" onclick={() => (workspace.inspectorDrawerOpen = true)}>
        <Adjustments />
        {workspace.inspector.title}
      </Button>
    {/if}
    {#if installable}
      <Button variant="outline" size="sm" onclick={install} aria-label={`Install ${config.appName}`} title="Install as an app that works offline">
        <Download />
        <span class="hidden sm:inline">Install</span>
      </Button>
    {/if}
    {#if tool}
      <ShareButton
        data={{ title: tool.title, text: `Try ${tool.title} on ${config.appName}`, url: page.url.href }}
        variant="ghost"
        size="icon"
        class="rounded-full max-[360px]:hidden max-sm:size-11"
      >
        <Share class="size-4" />
        <span class="sr-only">Share</span>
      </ShareButton>
    {/if}
    <ThemeToggle class="rounded-lg hover:bg-muted md:hidden" />
  </div>
</header>
