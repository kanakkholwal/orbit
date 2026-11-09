<script lang="ts">
  import { page } from "$app/state";
  import Logo from "$components/Logo.svelte";
  import ThemeToggle from "$components/ThemeToggle.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as Github, IconX as Close, IconAlignLeft as MenuIcon } from "$lib/icons";
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
  <header class="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
    <div class="mx-auto flex h-14 w-full max-w-5xl items-center gap-6 px-5 md:px-8">
      <a
        href="/"
        class="flex items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${config.appName} home`}
      >
        <Logo />
      </a>

      <nav class="ml-2 hidden items-center gap-1 md:flex" aria-label="Primary">
        {#each links as link (link.href)}
          <a
            href={link.href}
            aria-current={active(link.href) ? "page" : undefined}
            class={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-(--duration-fast) hover:bg-foreground/[0.04] hover:text-foreground",
              active(link.href) && "text-foreground"
            )}
          >
            {link.label}
          </a>
        {/each}
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <Button
          href={config.github}
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          size="icon"
          aria-label="GitHub"
          class="hidden sm:inline-flex"
        >
          <Github size={18} />
        </Button>
        <ThemeToggle class="size-8" />
        <Button href="/download" size="sm" class="hidden sm:inline-flex">Download</Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
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
        "grid transition-[grid-template-rows] duration-(--duration-base) ease-(--ease-ui-out) md:hidden",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      )}
      inert={!open}
    >
      <div class="overflow-hidden">
        <nav class="mx-auto flex max-w-5xl flex-col gap-1 border-t border-border px-5 py-3" aria-label="Mobile">
          {#each links as link (link.href)}
            <a href={link.href} class="rounded-md px-3 py-2.5 text-base text-foreground hover:bg-foreground/[0.04]">
              {link.label}
            </a>
          {/each}
          <Button href="/download" class="mt-2">Download</Button>
        </nav>
      </div>
    </div>
  </header>
{/if}
