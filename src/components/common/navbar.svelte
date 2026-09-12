<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { config } from "$constants/app";
  import { FloatingMenu } from "$lib/motion-core";
  import { appState } from "$stores/app-state.svelte";

  let isTauri = $derived(appState.isTauri);

  const menuGroups = [
    {
      title: "Platform",
      variant: "default" as const,
      links: [
        { label: "Home", href: "/" },
        { label: "Tools", href: "/#tools" },
        { label: "Explore", href: "/explore" },
      ],
    },
    {
      title: "Resources",
      variant: "muted" as const,
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "Changelog", href: "/changelog" },
        { label: "GitHub", href: config.github },
      ],
    },
    {
      title: "Company",
      variant: "muted" as const,
      links: [
        { label: "About", href: "/about" },
        { label: "Download", href: "/download" },
        { label: "Support", href: `mailto:${config.supportEmail}` },
      ],
    },
  ];
</script>

{#if isTauri}
  <header
    class="flex h-12 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl"
    data-tauri-drag-region
  >
    <a
      href="/"
      class="pointer-events-auto flex items-center gap-2 transition-opacity hover:opacity-80"
    >
      <Logo />
    </a>
    <ThemeToggle class="size-8" />
  </header>
{:else}
  <FloatingMenu
    {menuGroups}
    primaryButton={{ label: "Download", href: "/download" }}
    secondaryButton={{ label: "GitHub", href: config.github }}
    classes={{
      root: "rounded-xl border-border bg-background/80 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/70",
      overlay: "bg-background/70 backdrop-blur-xl",
      header: "p-1.5",
      toggleButton: "rounded-md pr-3 hover:bg-muted",
      toggleLine: "bg-foreground group-hover:bg-foreground",
      logo: "gap-2",
      actions: "gap-1.5",
      secondaryButton: "rounded-md px-3 text-muted-foreground hover:bg-muted hover:text-foreground",
      primaryButton: "rounded-md bg-primary px-4 text-primary-foreground shadow-xs hover:bg-primary-active",
      menuWrapper: "border-border",
      grid: "p-3 md:p-4",
      group: "rounded-xl",
      groupMuted: "bg-muted",
      groupTitle: "text-muted-foreground",
      link: "text-muted-foreground hover:text-foreground",
      linkUnderline: "bg-foreground",
      divider: "border-border",
    }}
  >
    {#snippet logo()}
      <a
        href="/"
        class="flex items-center rounded-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${config.appName} home`}
      >
        <Logo />
      </a>
    {/snippet}

    {#snippet actions()}
      <ThemeToggle class="size-10 rounded-md hover:bg-muted" />
    {/snippet}
  </FloatingMenu>
{/if}
