<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IconBrandGithub as Github } from "@tabler/icons-svelte";
  import { IconBrandTwitter as Twitter } from "@tabler/icons-svelte";
  const currentYear = new Date().getFullYear();
  const wordmark = config.appName.split(" ")[0].toUpperCase();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "All tools", href: "/explore" },
        { label: "Download", href: "/download" },
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

  let spot = $state({ x: 50, y: 50, on: false });

  function track(e: PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    spot = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      on: true,
    };
  }
</script>

<div aria-hidden="true" class="rail-dash w-full border-t-2"></div>

<footer class="rail-column mx-auto px-3 py-10 sm:px-6 sm:py-14">
  <div
    class="rounded-3xl border border-border bg-card px-6 py-8 sm:px-10 sm:py-10 dark:bg-background"
  >
    <div class="grid gap-10 md:grid-cols-6">
      <div class="flex flex-col items-start gap-4 md:col-span-2">
        <a
          href="/"
          class="flex w-fit items-center rounded-md transition-opacity duration-200 hover:opacity-80"
          aria-label={`${config.appName} home`}
        >
          <Logo />
        </a>
        <p
          class="max-w-xs text-pretty text-body leading-relaxed text-muted-foreground"
        >
          {config.appDescription}
        </p>
        <div class="flex gap-4">
          <Button
            href={config.github}
            target="_blank"
            variant="ghost"
            size="icon"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github size={18} />
          </Button>
          <Button
            href={config.twitter}
            target="_blank"
            rel="noopener noreferrer"
            variant="ghost"
            size="icon"
            aria-label="Twitter"
          >
            <Twitter size={18} />
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-4">
        {#each columns as col (col.title)}
          <nav class="flex flex-col gap-3" aria-label={col.title}>
            <span class="label-eyebrow text-foreground">{col.title}</span>
            <ul class="flex flex-col gap-2">
              {#each col.links as link (link.href + link.label)}
                <li>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    class="text-body text-muted-foreground transition-colors duration-200 hover:text-foreground"
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

    <div
      class="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-caption text-muted-foreground"
    >
      <p>© {currentYear} {config.appName} · v{config.appVersion}</p>
      <p>GPL-3.0 · Runs entirely on your device</p>
    </div>
  </div>

  <div
    aria-hidden="true"
    class="relative mt-6 select-none"
    onpointermove={track}
    onpointerleave={() => (spot.on = false)}
  >
    {#snippet mark(className: string)}
      <svg
        viewBox="0 0 1000 220"
        class="block h-auto w-full font-display {className}"
      >
        <text
          x="500"
          y="205"
          text-anchor="middle"
          textLength="990"
          lengthAdjust="spacing"
          font-size="270"
          font-weight="700"
        >
          {wordmark}
        </text>
      </svg>
    {/snippet}

    {@render mark("wordmark-base")}
    <div
      class="absolute inset-0 transition-opacity duration-300"
      style:opacity={spot.on ? 1 : 0}
      style:mask-image={`radial-gradient(circle 10rem at ${spot.x}% ${spot.y}%, black, transparent)`}
    >
      {@render mark("fill-primary")}
    </div>
  </div>
</footer>

<style>
  .wordmark-base :global(text) {
    fill: color-mix(in oklch, var(--foreground) 5%, transparent);
  }
</style>
