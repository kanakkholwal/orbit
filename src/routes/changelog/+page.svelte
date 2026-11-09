<script lang="ts">
  import { BrandPanel, PageHero, RailFrame, RailRow } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import {
    ChangelogFeed,
    ChangelogFeedDescription,
    ChangelogFeedEmpty,
    ChangelogFeedFilters,
    ChangelogFeedHeader,
    ChangelogFeedHeading,
    ChangelogFeedList,
    ChangelogFeedTitle,
    type ChangelogEntry,
    type ChangelogKind,
  } from "$components/blocks/changelog-feed";
  import { IconBrandGithub as Github } from "$lib/icons";

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

  const kindOf: Record<Tag, ChangelogKind> = {
    New: "new",
    Improved: "improved",
    Fixed: "fixed",
    "Heads up": "improved",
  };

  const feed: ChangelogEntry[] = entries.map((e) => ({
    id: e.version,
    date: e.date,
    version: e.version,
    kind: kindOf[e.items[0].tag],
    title: e.title,
    summary: e.summary,
    details: e.items.map((i) => `${i.tag}: ${i.text}`),
  }));
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
    <ChangelogFeed entries={feed} variant="timeline" class="mx-auto w-full max-w-3xl">
      <ChangelogFeedHeader>
        <ChangelogFeedHeading>
          <ChangelogFeedTitle>Releases</ChangelogFeedTitle>
          <ChangelogFeedDescription>Newest first. Filter by what changed.</ChangelogFeedDescription>
        </ChangelogFeedHeading>
      </ChangelogFeedHeader>
      <ChangelogFeedFilters />
      <ChangelogFeedList />
      <ChangelogFeedEmpty />
    </ChangelogFeed>
  </RailRow>

  <RailRow label="Follow releases">
    <BrandPanel
      title="Never miss an update"
      body="Every release is published on GitHub with the full list of changes."
    >
      {#snippet actions()}
        <Button href={`${config.github}/releases`} target="_blank" rel="noopener noreferrer" variant="secondary">
          View releases
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
