<script lang="ts">
  import Logo from "$components/Logo.svelte";
  import { config } from "$constants/app";
  import { toolsCategories } from "$constants/tools";
  import { ArrowUpRight, Github, Twitter } from "@lucide/svelte";

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Popular Tools",
      links: [
        { label: "Merge PDF", href: "/tools/merge-pdf" },
        { label: "Split PDF", href: "/tools/split-pdf" },
        { label: "Compress PDF", href: "/tools/compress-pdf" },
        { label: "Convert PDF", href: "/tools/pdf-to-img" },
      ],
    },
    {
      title: "Categories",
      links: toolsCategories.map((category) => ({
        label: category.name,
        href: `/explore?category=${category.id}`,
      })),
    },
  ];
</script>

<footer class="w-full border-t border-border/40 text-sm">
  <div class="container mx-auto max-w-app px-6 py-12 md:py-20 lg:px-8">
    <div class="xl:grid xl:grid-cols-5 xl:gap-8">
      <div class="space-y-8 xl:col-span-2">
        <a href="/" class="flex items-center gap-2 group w-fit">
          <Logo />
        </a>

        <p class="max-w-xs text-sm leading-6 text-muted-foreground">
          {config.appDescription}
        </p>
      </div>

      <div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-3 xl:mt-0 ml-auto">
        <div class="md:grid md:grid-cols-2 md:gap-8 space-y-10">
          {#each footerSections as footerSection}
            <div>
              <h3
                class="text-sm font-semibold leading-6 text-foreground tracking-tight"
              >
                {footerSection.title}
              </h3>
              <ul role="list" class="mt-6 space-y-4">
                {#each footerSection.links as link}
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
          {/each}
        </div>
      </div>
    </div>

    <div class="mt-16 border-t border-border/40 pt-8 sm:mt-20 lg:mt-24">
      <div class="flex flex-col items-center justify-between gap-6 md:flex-row">
        <p
          class="text-xs leading-5 text-muted-foreground text-center md:text-left"
        >
          &copy; {currentYear}
          {config.appName}. Open Source under MIT License.
        </p>

        <div class="flex items-center gap-6">
          <div class="flex gap-4">
            <a
              href={config.github}
              class="text-muted-foreground transition-colors hover:text-foreground"
              target="_blank" rel="noopener noreferrer"
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
