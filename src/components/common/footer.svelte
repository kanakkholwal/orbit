<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { siblingProducts } from "$constants/products";
  import { toolsCategories } from "$constants/tools";
  import { IconArrowUpRight as ArrowUpRight } from "$lib/icons";
  import { IconBrandGithub as Github } from "$lib/icons";
  import { IconBrandTwitter as Twitter } from "$lib/icons";
  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "All tools", href: "/explore" },
        { label: "Download", href: "/download" },
        { label: "Guides", href: "/articles" },
        { label: "Compare", href: "/compare" },
        { label: "Changelog", href: "/changelog" },
        { label: "Install PWA", href: "/install-pwa" },
      ],
    },
    {
      title: "Categories",
      links: toolsCategories.slice(0, 5).map((c) => ({
        label: c.name,
        href: `/explore?category=${c.id}`,
      })),
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Documentation", href: "/docs" },
        { label: "GitHub", href: config.github, external: true },
        { label: "Twitter", href: config.twitter, external: true },
        {
          label: "Support",
          href: `mailto:${config.supportEmail}`,
          external: true,
        },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ],
    },
  ];
</script>

<footer class="mt-24 border-t border-border">
  <div class="mx-auto w-full max-w-5xl px-5 py-12 md:px-8">
    <div class="grid gap-10 md:grid-cols-6">
      <div class="flex flex-col items-start gap-4 md:col-span-2">
        <a
          href="/"
          class="flex w-fit items-center rounded-md transition-opacity duration-(--duration-base) hover:opacity-80"
          aria-label={`${config.appName} home`}
        >
          <Logo />
        </a>
        <p class="max-w-xs text-pretty text-sm text-muted-foreground">{config.appDescription}</p>
        <div class="flex gap-1">
          <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon" aria-label="GitHub">
            <Github size={18} />
          </Button>
          <Button href={config.twitter} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon" aria-label="Twitter">
            <Twitter size={18} />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4">
        {#each columns as col (col.title)}
          <nav class="flex flex-col gap-3" aria-label={col.title}>
            <span class="text-xs font-medium text-foreground">{col.title}</span>
            <ul class="flex flex-col gap-2">
              {#each col.links as link (link.href + link.label)}
                <li>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    class="text-sm text-muted-foreground transition-colors duration-(--duration-base) hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </nav>
        {/each}
      </div>
    </div>

    <nav class="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-baseline sm:gap-6" aria-label="Other products">
      <span class="shrink-0 text-xs font-medium text-foreground">More from Nexonauts</span>
      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        {#each siblingProducts as product (product.href)}
          <li>
            <a
              href={product.href}
              target="_blank"
              rel="noopener noreferrer"
              class="group inline-flex items-baseline gap-1.5 text-sm text-muted-foreground transition-colors duration-(--duration-base) hover:text-foreground"
            >
              <span class="font-medium text-foreground">{product.name}</span>
              <span>{product.tagline}</span>
              <ArrowUpRight class="size-3.5 shrink-0 self-center transition-colors duration-(--duration-base) group-hover:text-primary" />
            </a>
          </li>
        {/each}
      </ul>
    </nav>

    <div class="mt-6 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-border pt-5 text-xs text-muted-foreground">
      <p>© {currentYear} {config.appName} · v{config.appVersion}</p>
      <p>GPL-3.0 · Runs entirely on your device</p>
    </div>
  </div>
</footer>
