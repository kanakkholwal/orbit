<script lang="ts">
  import { BrandPanel, PageHero, RailFrame, RailRow } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { IconBrandGithub as Github } from "@tabler/icons-svelte";

  type Tag = "New" | "Improved" | "Fixed" | "Heads up";

  type Entry = {
    version: string;
    date: string;
    title: string;
    summary: string;
    items: { tag: Tag; text: string }[];
  };

  const entries: Entry[] = [
    {
      version: "0.1.5",
      date: "2026-04-22",
      title: "A new menu and a refreshed look",
      summary: "Navigation was rebuilt around a floating menu, with better keyboard support and cleaner type everywhere.",
      items: [
        { tag: "New", text: "Floating menu for moving between pages." },
        { tag: "Improved", text: "Clearer contrast in both light and dark themes." },
        { tag: "Fixed", text: "The desktop app now remembers your theme choice." },
      ],
    },
    {
      version: "0.1.4",
      date: "2026-03-08",
      title: "Faster with big documents",
      summary: "Large PDFs open and save noticeably faster, and Orbit uses less memory once you close a file.",
      items: [
        { tag: "Improved", text: "30–45% faster page rendering on documents over 200 pages." },
        { tag: "Improved", text: "Less memory in use after closing a document." },
        { tag: "Fixed", text: "Scanned pages sometimes came back with no readable text." },
      ],
    },
    {
      version: "0.1.3",
      date: "2026-02-01",
      title: "Annotations and redaction",
      summary: "Two long-requested tools, both working entirely on your device.",
      items: [
        { tag: "New", text: "Highlight, underline and draw freehand on any page." },
        { tag: "New", text: "Permanently black out sensitive text, with a preview first." },
        { tag: "Heads up", text: "Saved export presets need to be saved again." },
      ],
    },
    {
      version: "0.1.2",
      date: "2025-12-12",
      title: "First public preview",
      summary: "The desktop app arrived alongside the web tools.",
      items: [
        { tag: "New", text: "Desktop app for Windows, macOS and Linux." },
        { tag: "New", text: "Install Orbit from your browser and use it offline." },
      ],
    },
  ];

  const tagStyles: Record<Tag, string> = {
    New: "bg-primary/10 text-primary",
    Improved: "bg-muted text-foreground",
    Fixed: "bg-success/10 text-success",
    "Heads up": "bg-warning/10 text-warning",
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
</script>

<Seo
  title="Changelog"
  description="Release notes for Orbit PDF: new tools, improvements and fixes."
  keywords={["orbit pdf changelog", "release notes", "pdf toolkit updates"]}
/>

<RailFrame>
  <RailRow divider={false} label="Changelog">
    <PageHero
      badge={`Latest: v${entries[0].version}`}
      title="What's new in"
      accent="Orbit"
      lede="Every meaningful change, from new tools to small fixes, written in plain language."
    />
  </RailRow>

  <RailRow label="Releases">
    <ol class="flex flex-col gap-6 px-1 py-6 sm:px-4 sm:py-8 lg:px-16 lg:py-10">
      {#each entries as entry (entry.version)}
        <li class="flex flex-col gap-4 lg:flex-row lg:gap-20">
          <div class="shrink-0 lg:w-110">
            <div class="flex items-baseline gap-3 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
              <span class="text-heading-sm font-medium tabular-nums text-foreground">v{entry.version}</span>
              <time datetime={entry.date} class="text-body text-muted-foreground">{formatDate(entry.date)}</time>
            </div>
          </div>

          <article class="panel-card min-w-0 flex-1 p-6">
            <h2 class="text-subheading font-medium text-foreground">{entry.title}</h2>
            <p class="mt-2 text-body leading-relaxed text-muted-foreground">{entry.summary}</p>
            <ul class="mt-5 flex flex-col gap-3 border-t border-border pt-5">
              {#each entry.items as item (item.text)}
                <li class="flex items-start gap-3 text-body">
                  <span
                    class={cn(
                      "mt-px inline-flex w-18 shrink-0 justify-center rounded-full px-2 py-0.5 text-caption font-medium",
                      tagStyles[item.tag]
                    )}
                  >
                    {item.tag}
                  </span>
                  <span class="text-foreground">{item.text}</span>
                </li>
              {/each}
            </ul>
          </article>
        </li>
      {/each}
    </ol>
  </RailRow>

  <RailRow label="Follow releases">
    <BrandPanel
      title="Never miss an update"
      body="Every release is published on GitHub with the full list of changes."
    >
      {#snippet actions()}
        <Button href={`${config.github}/releases`} target="_blank" rel="noopener noreferrer" variant="light">
          View releases
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
