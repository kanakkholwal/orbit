<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import { Container } from "$components/site";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IconBrandGithub as Github } from "@tabler/icons-svelte";

  const currentYear = new Date().getFullYear();

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

<footer class="w-full border-t border-border">
  <Container width="wide" class="py-16 md:py-20">
    <div class="grid gap-12 md:grid-cols-[1.4fr_2fr]">
      <div class="flex flex-col items-start gap-6">
        <a
          href="/"
          class="flex w-fit items-center rounded-md transition-opacity duration-200 hover:opacity-80"
          aria-label={`${config.appName} home`}
        >
          <Logo />
        </a>
        <p class="max-w-sm text-pretty text-caption leading-relaxed text-muted-foreground">
          {config.appDescription}
        </p>
        <a
          href={config.github}
          target="_blank"
          rel="noopener noreferrer"
          class="pressable inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-200 hover:border-border-strong hover:text-foreground"
          aria-label="GitHub"
        >
          <Github size={16} />
        </a>
      </div>

      <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {#each columns as col (col.title)}
          <nav class="flex flex-col gap-4" aria-label={col.title}>
            <span class="label-eyebrow border-b border-border pb-3 text-muted-foreground">
              {col.title}
            </span>
            <ul class="flex flex-col gap-2.5">
              {#each col.links as link (link.href + link.label)}
                <li>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    class="text-caption text-muted-foreground transition-colors duration-200 hover:text-foreground"
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
      class="mt-16 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-caption text-muted-foreground sm:flex-row sm:items-center"
    >
      <p>© {currentYear} · {config.appName} · v{config.appVersion}</p>
      <p>GPL-3.0 · Runs entirely on your device</p>
    </div>
  </Container>
</footer>
