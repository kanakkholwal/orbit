<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { config } from "$constants/app";
  import { recentTools } from "$lib/runtime/recent-tools.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { workspace } from "$stores/workspace.svelte";
  import { getTool } from "$tools/list";
  import {
    IconBook2 as Docs,
    IconCompass as Compass,
    IconDownload as Download,
    IconHome as Home,
    IconLayoutSidebar as PanelIcon,
    IconSearch as Search,
    IconSettings as SettingsIcon,
    IconBrandGithub,
  } from "$lib/icons";
  import RailLink from "./RailLink.svelte";

  let { wide, class: className }: { wide: boolean; class?: string } = $props();

  const path = $derived(page.url.pathname);
  const recent = $derived(
    recentTools.items
      .map((r) => getTool(r.slug))
      .filter((t) => t !== null)
      .slice(0, 5)
  );
</script>

<nav
  aria-label="Workspace"
  class={cn("no-scrollbar flex w-12 shrink-0 flex-col items-center gap-0.5 overflow-y-auto py-2", className)}
>
  <a
    href="/"
    aria-label={`${config.appName} home`}
    class="mb-1.5 grid size-9 place-items-center rounded-lg text-foreground transition-opacity hover:opacity-80"
  >
    <Logo markOnly size="xs" class="h-6 text-foreground" />
  </a>

  <RailLink label="Home" icon={Home} href="/home" active={path === "/home"} />
  <RailLink label="Explore tools" icon={Compass} href="/explore" active={path.startsWith("/explore")} />
  <RailLink label="Search" icon={Search} onclick={() => (workspace.searchOpen = true)} />
  <RailLink
    label={wide && workspace.panelPinned ? "Hide tools panel" : "Show tools panel"}
    icon={PanelIcon}
    onclick={() => workspace.togglePanel(wide)}
  />

  {#if recent.length > 0}
    <div class="my-1.5 h-px w-5 bg-border" role="separator"></div>
    <span class="sr-only">Recent tools</span>
    {#each recent as tool (tool.slug)}
      <RailLink
        label={tool.title}
        icon={tool.icon}
        href={`/tools/${tool.slug}`}
        active={path === `/tools/${tool.slug}`}
      />
    {/each}
  {/if}

  <div class="flex-1"></div>

  <RailLink label="Settings" icon={SettingsIcon} href="/settings" active={path.startsWith("/settings")} />
  <RailLink label="Star on GitHub" icon={IconBrandGithub} href={config.github} />
  {#if !appState.isTauri}
    <RailLink label="Get the desktop app" icon={Download} href="/download" />
  {/if}
  <ThemeToggle class="size-9 shrink-0 rounded-lg hover:bg-foreground/[0.04] focus-visible:ring-inset" />
</nav>
