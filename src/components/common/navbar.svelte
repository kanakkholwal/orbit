<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as Github, IconX as Close, IconAlignLeft as MenuIcon, IconSearch as Search } from "$lib/icons";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";

  let isTauri = $derived(appState.isTauri);
  let open = $state(false);

  const links = [
    { label: "Tools", href: "/explore" },
    { label: "Guides", href: "/articles" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
    { label: "About", href: "/about" },
  ];

  const active = (href: string) =>
    page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);

  $effect(() => {
    void page.url.pathname;
    open = false;
  });
</script>

{#if isTauri}
  <header
    class="flex h-12 w-full items-center justify-between border-b border-border bg-background px-4"
    data-tauri-drag-region
  >
    <a href="/" class="pointer-events-auto flex items-center gap-2 transition-opacity hover:opacity-80">
      <Logo />
    </a>
    <ThemeToggle class="size-8" />
  </header>
{:else}
  <header class="sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 md:px-8">
      <a
        href="/"
        class="flex items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${config.appName} home`}
      >
        <Logo />
      </a>

      <nav class="ml-2 hidden items-center gap-0.5 md:flex" aria-label="Primary">
        {#each links as link (link.href)}
          <a
            href={link.href}
            aria-current={active(link.href) ? "page" : undefined}
            class={cn(
              "rounded-full px-3.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-foreground/[0.05] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
              active(link.href) && "bg-foreground/[0.06] font-medium text-foreground"
            )}
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <div class="ml-auto flex items-center gap-1.5">
        <a
          href="/explore"
          class="hidden h-9 items-center gap-2 rounded-full bg-muted/70 px-3.5 text-sm text-muted-foreground outline-none transition-colors duration-(--duration-fast) hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring lg:flex lg:w-56"
        >
          <Search class="size-4" />
          Search tools
        </a>
        <Button
          href={config.github}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          size="icon"
          aria-label="GitHub"
          class="hidden rounded-full bg-muted/60 hover:bg-muted sm:inline-flex"
        >
          <Github size={18} />
        </Button>
        <ThemeToggle class="bg-muted/60 hover:bg-muted" />
        <Button href="/download" size="sm" class="ml-1 hidden rounded-full px-4 sm:inline-flex">Get the app</Button>
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full bg-muted/60 hover:bg-muted md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onclick={() => (open = !open)}
        >
          {#if open}<Close size={18} />{:else}<MenuIcon size={18} />{/if}
        </Button>
      </div>
    </div>

    <div
      id="mobile-nav"
      class={cn(
        "grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-ui-out) motion-reduce:transition-none md:hidden",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      inert={!open}
    >
      <div class="overflow-hidden">
        <nav class="mx-auto flex max-w-6xl flex-col gap-1 px-5 pb-4 pt-1" aria-label="Mobile">
          {#each links as link (link.href)}
            <a
              href={link.href}
              aria-current={active(link.href) ? "page" : undefined}
              class={cn(
                "flex min-h-11 items-center rounded-xl px-3 text-base text-foreground/80 outline-none hover:bg-foreground/[0.05] focus-visible:ring-2 focus-visible:ring-ring",
                active(link.href) && "bg-foreground/[0.06] font-medium text-foreground"
              )}
            >
              {link.label}
            </a>
          {/each}
          <Button href="/download" class="mt-2">Get the app</Button>
        </nav>
      </div>
    </div>
  </header>
{/if}
