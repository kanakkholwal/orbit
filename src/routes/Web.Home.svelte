<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import {
    ChapterRule,
    Container,
    FaqList,
    Reveal,
    Section,
  } from "$components/site";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { rise, stagger } from "$lib/motion";
  import { toolList } from "$tools/list";
  import {
    IconArrowRight as ArrowRight,
    IconArrowUpRight as ArrowUpRight,
    IconBrandGithub as Github,
    IconWorld as Globe,
    IconLock as Lock,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { fly } from "svelte/transition";

  const displayTools = toolList?.slice(0, 10) ?? [];

  const stats: [string, string][] = [
    ["100%", "Client side"],
    ["0", "Server uploads"],
    ["WASM", "Native speed"],
    ["GPL", "Open source"],
  ];

  // One hue per detail, never two on one component.
  const pillars = [
    {
      title: "Local processing",
      body: "Every transformation runs inside your browser sandbox. No relay servers, no background uploads, no telemetry on file contents.",
      icon: Lock,
      hue: "text-tag-lavender",
    },
    {
      title: "Native speed",
      body: "Tools share a WebAssembly core tuned for streaming throughput. Hundred-page documents stay responsive on modest hardware.",
      icon: Zap,
      hue: "text-tag-tangerine",
    },
    {
      title: "Offline first",
      body: "Install the PWA or download the desktop build. Works in airplane mode, on flaky networks, or air-gapped machines.",
      icon: Globe,
      hue: "text-tag-green",
    },
  ];

  const steps = [
    {
      n: "01",
      title: "Open a tool",
      body: "Pick from the library. Nothing loads until you do, and nothing is installed.",
    },
    {
      n: "02",
      title: "Drop your file",
      body: "The document is read into memory by the page. It never leaves the tab.",
    },
    {
      n: "03",
      title: "Save the result",
      body: "The output is written straight to your disk. Close the tab and nothing is left behind.",
    },
  ];

  const faqs = [
    {
      q: "Are my files uploaded anywhere?",
      a: "No. Every tool runs in your browser through WebAssembly. There is no upload endpoint, no relay server and no queue — the document is read into memory by the page and written back to your disk.",
    },
    {
      q: "Is Orbit really free?",
      a: "Yes, and there is no watermark, no account and no page limit. Orbit is GPL-3.0 licensed and the source is on GitHub.",
    },
    {
      q: "How large a document can it handle?",
      a: "The ceiling is your own machine's memory rather than a server quota. Hundred-page documents are routine; very large scanned files depend on available RAM.",
    },
    {
      q: "Does it work offline?",
      a: "Yes. Install the PWA or the desktop build and every tool keeps working in airplane mode, on a flaky network, or on an air-gapped machine.",
    },
    {
      q: "Which browsers are supported?",
      a: "Any current Chrome, Edge, Firefox or Safari. The tools depend on WebAssembly, with a plain download fallback wherever direct file-system access is unavailable.",
    },
    {
      q: "Why does my fan spin up?",
      a: "Because the work is happening on your hardware rather than on a server. Rendering, OCR and compression are CPU-bound, and they run in a worker so the interface stays responsive.",
    },
  ];
</script>

<Seo
  title="Free, Fast & Offline PDF Tools | Orbit"
  description={config.appDescription}
  keywords={config.appKeywords}
  isBase={true}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="flex-1">
    <!-- Hero — unchanged -->
    <section class="px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-44">
      <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 text-center">
        <span class="pill label-eyebrow bg-card text-muted-foreground" in:fly={rise(6)}>
          <span class="relative flex size-1.5" aria-hidden="true">
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none"
            ></span>
            <span class="relative inline-flex size-1.5 rounded-full bg-primary"></span>
          </span>
          v{config.appVersion} · Open preview
        </span>

        <h1
          class="text-balance text-heading-lg text-foreground md:text-display"
          in:fly={rise(12, 60)}
        >
          A PDF toolkit that works
          <span class="text-primary">entirely on your device.</span>
        </h1>

        <p
          class="max-w-xl text-pretty text-body-lg leading-relaxed text-muted-foreground"
          in:fly={rise(10, 110)}
        >
          Edit, convert, sign, and merge documents with a quiet, fast interface
          built for people who care about their files staying their own.
        </p>

        <div
          class="mt-2 flex flex-wrap items-center justify-center gap-2"
          in:fly={rise(10, 160)}
        >
          <Button href="/explore" size="lg">
            Start processing
            <ArrowRight />
          </Button>
          <Button
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            <Github />
            Star on GitHub
          </Button>
        </div>
      </div>

      <dl
        class="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-8 border-t border-border pt-10 text-center sm:grid-cols-4"
      >
        {#each stats as [val, label], i (label)}
          <div class="flex flex-col gap-1" in:fly={rise(8, 220 + stagger(i, 40))}>
            <dd
              class="text-heading-sm tabular-nums text-foreground"
              class:text-primary={i === 0}
            >
              {val}
            </dd>
            <dt class="label-eyebrow text-muted-foreground">{label}</dt>
          </div>
        {/each}
      </dl>
    </section>

    <!-- 01 · Tools — a gap-px hairline grid, not a stack of floating cards -->
    <Section id="tools">
      <Container width="wide">
        <ChapterRule index="01" label="Tools">
          {#snippet action()}
            <Button href="/explore" variant="outline" size="sm">
              All {toolList.length} tools
              <ArrowUpRight />
            </Button>
          {/snippet}
        </ChapterRule>

        <div class="mt-10 grid gap-10 md:grid-cols-12">
          <div class="md:col-span-5">
            <h2 class="text-balance text-heading text-foreground md:text-heading-lg">
              Every tool, one quiet interface.
            </h2>
            <p class="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Merge, split, compress, sign, redact, convert. Each one opens in
              the same shell, keeps the same shortcuts, and finishes without
              asking you to sign in.
            </p>
          </div>

          <div class="md:col-span-7">
            <ul
              class="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2"
            >
              {#each displayTools as tool, i (tool.slug)}
                <li class="contents">
                  <a
                    href={`/tools/${tool.slug}`}
                    class="group flex items-center gap-3 bg-card p-4 transition-colors duration-200 hover:bg-paper"
                  >
                    <span class="tabular-nums text-caption text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span class="min-w-0 flex-1 truncate text-body-sm font-medium text-foreground">
                      {tool.title}
                    </span>
                    <ArrowUpRight
                      class="size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      </Container>
    </Section>

    <!-- 02 · Architecture — full-bleed tonal band, editorial split -->
    <Section band>
      <Container width="wide">
        <ChapterRule index="02" label="Architecture" />

        <div class="mt-10 grid gap-12 md:grid-cols-12">
          <div class="md:col-span-5">
            <h2 class="text-balance text-heading text-foreground md:text-heading-lg">
              Privacy is not a setting.
              <span class="text-primary">It is the architecture.</span>
            </h2>
            <p class="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
              Conventional PDF tools upload your documents to remote servers and
              trust you to read the privacy policy. Orbit runs the entire
              transformation graph locally, so there is nothing to upload and
              nothing to leak.
            </p>
          </div>

          <ul class="md:col-span-6 md:col-start-7">
            {#each pillars as pillar, i (pillar.title)}
              <li class="border-b border-border last:border-b-0">
                <Reveal delay={stagger(i, 70)}>
                  <div class="flex gap-4 py-6">
                    <pillar.icon
                      class={`glyph-duotone mt-0.5 size-5 shrink-0 ${pillar.hue}`}
                    />
                    <div class="flex flex-col gap-1.5">
                      <h3 class="text-body font-semibold text-foreground">
                        {pillar.title}
                      </h3>
                      <p class="text-pretty text-body-sm leading-relaxed text-muted-foreground">
                        {pillar.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              </li>
            {/each}
          </ul>
        </div>
      </Container>
    </Section>

    <!-- 03 · How it works -->
    <Section>
      <Container width="wide">
        <ChapterRule index="03" label="How it works" />

        <ol
          class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3"
        >
          {#each steps as step, i (step.n)}
            <li class="bg-card p-6">
              <Reveal delay={stagger(i, 70)}>
                <span
                  class="font-display text-heading-sm font-bold tabular-nums text-border-strong"
                >
                  {step.n}
                </span>
                <h3 class="mt-3 text-body font-semibold text-foreground">
                  {step.title}
                </h3>
                <p class="mt-1.5 text-pretty text-body-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </Reveal>
            </li>
          {/each}
        </ol>
      </Container>
    </Section>

    <!-- 04 · FAQ — sticky title left, single-open accordion right -->
    <Section band>
      <Container width="wide">
        <div class="grid gap-10 md:grid-cols-12">
          <div class="md:col-span-4">
            <div class="md:sticky md:top-24">
              <span class="label-eyebrow text-muted-foreground">Questions</span>
              <h2 class="mt-3 text-balance text-heading text-foreground">
                Everything people ask first.
              </h2>
              <p class="mt-4 max-w-xs text-pretty text-body-sm leading-relaxed text-muted-foreground">
                Still stuck? Write to
                <a
                  href={`mailto:${config.supportEmail}`}
                  class="text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-200 hover:decoration-current"
                >
                  support</a
                >.
              </p>
            </div>
          </div>

          <div class="md:col-span-7 md:col-start-6">
            <FaqList items={faqs} />
          </div>
        </div>
      </Container>
    </Section>

    <!-- Closing CTA — the page's one dark band, bookending the hero -->
    <section class="band-dark">
      <Container width="wide" class="py-20 md:py-28">
        <div
          class="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div class="max-w-xl">
            <span class="label-eyebrow band-muted">Get started</span>
            <h2 class="mt-3 text-balance text-heading md:text-heading-lg">
              Drop a file. Keep your privacy.
            </h2>
            <p class="band-muted mt-4 text-pretty leading-relaxed">
              No account. No upload. Open a tool, work, close the tab — there is
              nothing left behind.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <Button href="/explore" variant="light">
              Start processing
              <ArrowRight />
            </Button>
            <Button
              href="/download"
              variant="raw"
              class="band-rule inline-flex h-10 items-center justify-center gap-2 rounded-md border px-5 text-body-sm font-medium text-current transition-colors duration-200 hover:bg-white/10"
            >
              Download app
              <ArrowUpRight class="size-4" />
            </Button>
          </div>
        </div>

        <ul class="band-rule mt-14 grid grid-cols-1 gap-6 border-t pt-6 sm:grid-cols-3">
          {#each steps as step (step.n)}
            <li class="flex items-baseline gap-3">
              <span class="band-muted font-display text-caption font-bold tabular-nums">
                {step.n}
              </span>
              <span class="text-body-sm">{step.title}</span>
            </li>
          {/each}
        </ul>
      </Container>
    </section>
  </main>

  <Footer />
</div>
