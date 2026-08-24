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
    class="flex h-12 w-full items-center justify-between border-b border-border/50 bg-card/80 px-4 backdrop-blur-2xl supports-backdrop-filter:bg-card/60"
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
      root: "border border-border/50 bg-card/40 ring-1 ring-white/10 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.18)] backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-card/30 dark:ring-white/5",
      overlay: "bg-background/70 backdrop-blur-xl backdrop-saturate-150",
      header: "px-2 py-1 lg:max-w-5xl",
      toggleButton: "rounded-full px-2.5 hover:bg-secondary/70",
      toggleLine: "bg-foreground group-hover:bg-foreground",
      logo: "gap-2",
      secondaryButton:
        "rounded-full text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
      primaryButton:
        "rounded-sm bg-primary/5 text-primary hover:bg-primary/10 shadow-sm px-3 sm:px-4",
      menuWrapper: "border-border/50",
      grid: "p-3 md:p-4",
      group: "rounded-xl",
      groupMuted: "bg-muted/40",
      groupTitle: "text-muted-foreground/60",
      link: "text-muted-foreground hover:text-foreground",
      linkUnderline: "bg-foreground",
      divider: "border-border/40",
    }}
  >
    {#snippet logo()}
      <a
        href="/"
        class="flex items-center transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 rounded-full"
        aria-label={`${config.appName} home`}
      >
        <Logo />
      </a>
    {/snippet}

    {#snippet actions()}
      <ThemeToggle class="size-9 rounded-sm" />
    {/snippet}
  </FloatingMenu>
{/if}
