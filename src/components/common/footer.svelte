<script lang="ts">
  import {
    ArrowUpRight,
    FileText,
    Github,
    Twitter
  } from "@lucide/svelte";

  const currentYear = new Date().getFullYear();

  // Expanded data for a better 4-column grid look
  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Merge PDF", href: "/merge" },
        { label: "Split PDF", href: "/split" },
        { label: "Compress", href: "/compress" },
        { label: "Convert", href: "/convert" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "/docs" },
        { label: "API Reference", href: "/api" },
        { label: "Blog", href: "/blog" },
        { label: "Community", href: "/community" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
      ],
    },
  ];
</script>

<footer class="w-full border-t border-border/40 bg-background text-sm">
  <div class="container mx-auto max-w-7xl px-6 py-12 md:py-20 lg:px-8">
    <div class="xl:grid xl:grid-cols-5 xl:gap-8">
      <div class="space-y-8 xl:col-span-2">
        <a href="/" class="flex items-center gap-2 group w-fit">
          <div
            class="flex size-8 items-center justify-center rounded-lg border border-border bg-linear-to-br from-primary/10 to-transparent text-primary shadow-sm transition-all group-hover:shadow-md group-hover:from-primary/20"
          >
            <FileText size={16} strokeWidth={2.5} />
          </div>
          <span class="text-lg font-bold tracking-tight text-foreground">
            Nexo PDF
          </span>
        </a>

        <p class="max-w-xs text-sm leading-6 text-muted-foreground">
          The privacy-first PDF toolkit for professionals. Process documents
          locally via WebAssembly without them ever touching a server.
        </p>

        <div class="flex items-center gap-4">
          <div
            class="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
              ></span>
            </span>
            All Systems Normal
          </div>
        </div>
      </div>

      <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0">
        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3
              class="text-sm font-semibold leading-6 text-foreground tracking-tight"
            >
              Product
            </h3>
            <ul role="list" class="mt-6 space-y-4">
              {#each footerSections[0].links as link}
                <li>
                  <a
                    href={link.href}
                    class="group flex w-fit items-center gap-1 text-sm leading-6 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      class="opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100"
                    />
                  </a>
                </li>
              {/each}
            </ul>
          </div>

          <div class="mt-10 md:mt-0">
            <h3
              class="text-sm font-semibold leading-6 text-foreground tracking-tight"
            >
              Resources
            </h3>
            <ul role="list" class="mt-6 space-y-4">
              {#each footerSections[1].links as link}
                <li>
                  <a
                    href={link.href}
                    class="group flex w-fit items-center text-sm leading-6 text-muted-foreground transition-all hover:translate-x-0.5 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <div class="md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h3
              class="text-sm font-semibold leading-6 text-foreground tracking-tight"
            >
              Legal
            </h3>
            <ul role="list" class="mt-6 space-y-4">
              {#each footerSections[2].links as link}
                <li>
                  <a
                    href={link.href}
                    class="group flex w-fit items-center text-sm leading-6 text-muted-foreground transition-all hover:translate-x-0.5 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
      <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
        <p
          class="text-xs leading-5 text-muted-foreground text-center md:text-left"
        >
          &copy; {currentYear} Nexo PDF. Open Source under MIT License.
        </p>

        <div class="flex items-center gap-6">
          <div class="flex gap-4">
            <a
              href="https://github.com/kanakkholwal/nexo-pdf"
              class="text-muted-foreground transition-colors hover:text-foreground"
            >
              <span class="sr-only">GitHub</span>
              <Github size={18} />
            </a>
            <a
              href="https://twitter.com/kanakkholwal"
              class="text-muted-foreground transition-colors hover:text-foreground"
            >
              <span class="sr-only">Twitter</span>
              <Twitter size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>
