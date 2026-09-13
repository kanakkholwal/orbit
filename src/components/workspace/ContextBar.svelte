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
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import type { ToolConfig } from "$tools/list";
  import {
    IconAdjustmentsHorizontal as Adjustments,
    IconCompass as Compass,
    IconDownload as Download,
    IconHome as Home,
    IconShare as Share,
  } from "@tabler/icons-svelte";
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
    path.startsWith("/explore") ? { title: "Explore tools", icon: Compass } : { title: "Home", icon: Home }
  );
</script>

<header
  class="flex min-h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-3 md:px-4"
  style="padding-top: env(safe-area-inset-top);"
>
  <a href="/" aria-label={`${config.appName} home`} class="grid size-9 shrink-0 place-items-center md:hidden">
    <Logo markOnly size="xs" class="h-6 text-foreground" />
  </a>

  <div class="flex min-w-0 flex-1 items-center gap-2.5">
    {#if tool}
      <span class="hidden size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:grid">
        <tool.icon class="size-4" />
      </span>
      <div class="min-w-0">
        <h1 class="truncate text-body font-medium text-foreground">{tool.title}</h1>
        {#if category}
          <p class="hidden truncate text-caption text-muted-foreground sm:block">{category}</p>
        {/if}
      </div>
    {:else}
      <place.icon class="hidden size-4 text-muted-foreground sm:block" />
      <span class="truncate text-body font-medium text-foreground">{place.title}</span>
    {/if}
  </div>

  {#if tool}
    <SearchTrigger class="hidden w-64 md:flex lg:w-80" />
  {/if}

  <div class="flex flex-1 items-center justify-end gap-1.5">
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
      >
        <Share class="size-4" />
        <span class="hidden lg:inline">Share</span>
      </ShareButton>
    {/if}
    <ThemeToggle class="size-9 rounded-lg hover:bg-muted md:hidden" />
  </div>
</header>
