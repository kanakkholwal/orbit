<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { cn } from "$lib/utils";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";

  type Tag = "Feature" | "Improvement" | "Fix" | "Breaking";

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
      title: "Floating menu and refreshed shell",
      summary:
        "A redesigned navigation shell with motion-core's floating menu, broader keyboard support, and cleaner type across the marketing surface.",
      items: [
        { tag: "Feature", text: "Floating menu navigation with split-text reveal." },
        { tag: "Improvement", text: "Glassmorphism header with refined contrast in both themes." },
        { tag: "Fix", text: "Theme toggle now persists correctly inside Tauri builds." },
      ],
    },
    {
      version: "0.1.4",
      date: "2026-03-08",
      title: "Faster local PDF pipeline",
      summary:
        "WebAssembly engines were upgraded across the board, with measurable improvements on large documents.",
      items: [
        { tag: "Improvement", text: "30–45% faster render on 200+ page PDFs." },
        { tag: "Improvement", text: "Lower idle memory after closing a document." },
        { tag: "Fix", text: "Edge case in OCR that produced empty text layers." },
      ],
    },
    {
      version: "0.1.3",
      date: "2026-02-01",
      title: "Annotations and redaction",
      summary:
        "Two long-requested tools, both running fully on-device.",
      items: [
        { tag: "Feature", text: "Highlight, underline, and freehand annotations." },
        { tag: "Feature", text: "Permanent redaction with previewable hits." },
        { tag: "Breaking", text: "Renamed export profile keys; old presets need re-saving." },
      ],
    },
    {
      version: "0.1.2",
      date: "2025-12-12",
      title: "Initial public preview",
      summary:
        "First public release of the desktop app alongside the existing web tools.",
      items: [
        { tag: "Feature", text: "Tauri desktop builds for Windows, macOS, and Linux." },
        { tag: "Feature", text: "Offline-first PWA with installable shortcut." },
      ],
    },
  ];

  const tagStyles: Record<Tag, string> = {
    Feature: "bg-primary/10 text-primary",
    Improvement: "bg-muted text-foreground",
    Fix: "bg-success/10 text-success",
    Breaking: "bg-destructive/10 text-destructive",
  };
</script>

<Seo
  title="Changelog"
  description="Release notes and product updates for Orbit PDF — features, improvements, and fixes shipped over time."
  keywords={["orbit pdf changelog", "release notes", "pdf toolkit updates"]}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
    <header
      class="flex flex-col gap-4 border-b border-border pb-10"
      in:fly={{ y: 12, duration: 500, easing: cubicOut }}
    >
      <span
        class="label-eyebrow text-primary"
      >
        Changelog
      </span>
      <h1
        class="text-heading text-foreground sm:text-heading-lg"
      >
        What's new in
        <span class="text-primary">Orbit</span>
      </h1>
      <p class="max-w-xl text-body leading-relaxed text-muted-foreground">
        A running log of meaningful changes — new tools, performance work, and
        fixes — written by the people who shipped them.
      </p>
    </header>

    <ol class="mt-12 flex flex-col gap-14">
      {#each entries as entry, i (entry.version)}
        <li
          class="relative flex flex-col gap-5 border-l border-border pl-6 sm:pl-8"
          in:fly={{
            y: 16,
            duration: 520,
            delay: 80 + i * 70,
            easing: cubicOut,
          }}
        >
          <span
            class="absolute -left-1.25 top-1 size-2.5 rounded-full bg-primary ring-4 ring-background"
            aria-hidden="true"
          ></span>

          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              class="font-mono text-caption font-medium tracking-wider text-primary"
            >
              v{entry.version}
            </span>
            <span class="text-caption text-muted-foreground">·</span>
            <time
              datetime={entry.date}
              class="font-mono text-caption text-muted-foreground"
            >
              {new Date(entry.date).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>

          <h2
            class="text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
          >
            {entry.title}
          </h2>

          <p class="text-body leading-relaxed text-muted-foreground">
            {entry.summary}
          </p>

          <ul class="mt-1 flex flex-col gap-2.5">
            {#each entry.items as item}
              <li class="flex items-start gap-3 text-body-sm">
                <span
                  class={cn(
                    "mt-0.5 inline-flex shrink-0 items-center rounded-sm px-2 py-0.5 label-eyebrow",
                    tagStyles[item.tag]
                  )}
                >
                  {item.tag}
                </span>
                <span class="text-foreground">{item.text}</span>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ol>

    <div
      class="mt-20 rounded-md border border-border bg-muted/40 p-6"
      in:fade={{ duration: 400, delay: 360 }}
    >
      <p class="label-eyebrow text-muted-foreground">
        Subscribe
      </p>
      <p class="mt-2 text-body-sm text-foreground">
        Follow development on
        <a
          href="https://github.com/kanakkholwal/orbit/releases"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium underline underline-offset-4 hover:text-primary"
        >
          GitHub Releases
        </a>
        for tagged builds and full diffs.
      </p>
    </div>
  </main>

  <Footer />
</div>
