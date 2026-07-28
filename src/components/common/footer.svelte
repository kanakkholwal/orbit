<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { IconBrandGithub as Github } from "@tabler/icons-svelte";

  const currentYear = new Date().getFullYear();

  const columns = [
    {
      title: "Product",
      links: [
        { label: "All tools", href: "/explore" },
        { label: "Explore", href: "/explore" },
        { label: "Download", href: "/download" },
        { label: "Changelog", href: "/changelog" },
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
        { label: "Support", href: `mailto:${config.supportEmail}`, external: true },
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

<footer class="w-full border-t border-border/60">
  <div class="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-20">
    <div class="grid gap-12 md:grid-cols-[1.4fr_2fr]">
      <div class="flex flex-col gap-6">
        <a
          href="/"
          class="flex w-fit items-center transition-opacity hover:opacity-90"
          aria-label={`${config.appName} home`}
        >
          <Logo />
        </a>
        <p class="max-w-sm text-sm leading-relaxed text-muted-foreground">
          {config.appDescription}
        </p>
        <div class="mt-2 flex items-center gap-3">
          <a
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex size-9 items-center justify-center rounded-sm border border-border/60 text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
            aria-label="GitHub"
          >
            <Github size={16} />
          </a>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-8 sm:grid-cols-4">
        {#each columns as col, i (col.title)}
          <div class="flex flex-col gap-5">
            <div
              class="flex items-baseline justify-between border-b border-border/60 pb-3"
            >
              <span
                class="label-eyebrow text-muted-foreground"
              >
                {col.title}
              </span>
              <span
                class="font-mono text-[10px] tabular-nums text-muted-foreground/40"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            <ul class="flex flex-col gap-3">
              {#each col.links as link (link.href + link.label)}
                <li>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    class="group inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span class="relative">
                      {link.label}
                      <span
                        aria-hidden="true"
                        class="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-[width] duration-300 ease-out group-hover:w-full"
                      ></span>
                    </span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </div>

    <div
      class="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center"
    >
      <p
        class="label-eyebrow text-muted-foreground"
      >
        © {currentYear} · {config.appName} · v{config.appVersion}
      </p>
      <div class="flex items-center gap-4">
        <a
          href="/privacy"
          class="font-mono text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          Privacy
        </a>
        <a
          href="/terms"
          class="font-mono text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          Terms
        </a>
        <span class="font-mono text-[11px] text-muted-foreground/70">
          GPL-3.0
        </span>
      </div>
    </div>
  </div>
</footer>
