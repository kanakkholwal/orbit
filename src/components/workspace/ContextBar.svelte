<script lang="ts">
  import { page } from "$app/state";
  import ShareButton from "$components/application/ShareButton.svelte";
  import SearchTrigger from "$components/layout/SearchTrigger.svelte";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Badge } from "$components/ui/badge";
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
    IconSettings as SettingsIcon,
    IconShare as Share,
    IconShieldCheck as Shield,
  } from "$lib/icons";
  import { toast } from "svelte-sonner";

  let { tool, wide }: { tool: ToolConfig | null; wide: boolean } = $props();

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
        : { title: "Home", icon: Home }
  );
</script>

<header
  class="flex min-h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-3 md:px-4"
  style="padding-top: env(safe-area-inset-top);"
>
  <a href="/" aria-label={`${config.appName} home`} class="grid size-9 shrink-0 place-items-center max-[360px]:hidden md:hidden">
    <Logo markOnly size="xs" class="h-6 text-foreground" />
  </a>

  <div class="flex min-w-0 flex-1 basis-0 items-center">
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
            <BreadcrumbPage class="flex min-w-0 items-center gap-2">
              <tool.icon class="size-4 shrink-0 text-primary" />
              <span class="truncate" title={tool.title}>{tool.title}</span>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    {:else}
      <place.icon class="mr-2 hidden size-4 text-muted-foreground sm:block" />
      <span class="truncate text-sm font-medium text-foreground">{place.title}</span>
    {/if}
  </div>

  {#if tool}
    <SearchTrigger class="hidden w-72 shrink-0 lg:flex xl:w-80" />
  {/if}

  <div class="flex shrink-0 items-center justify-end gap-1.5 md:flex-1 md:basis-0">
    {#if tool}
      <Badge variant="secondary" class="hidden shrink-0 xl:inline-flex">
        <Shield class="size-3" />
        On device
      </Badge>
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
        size="sm"
        class="max-[360px]:hidden"
      >
        <Share class="size-4" />
        <span class="hidden lg:inline">Share</span>
      </ShareButton>
    {/if}
    <ThemeToggle class="size-9 rounded-lg hover:bg-muted md:hidden" />
  </div>
</header>
