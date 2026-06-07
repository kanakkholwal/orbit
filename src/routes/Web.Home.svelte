<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    ArrowRight,
    ArrowUpRight,
    Github,
    Globe,
    Lock,
    Zap
  } from "@lucide/svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";

  const displayTools = toolList?.slice(0, 8) ?? [];

  const stats: [string, string][] = [
    ["100%", "Client side"],
    ["0", "Server uploads"],
    ["WASM", "Native speed"],
    ["GPL", "Open source"],
  ];

  const features = [
    {
      title: "Local processing",
      body: "Every transformation runs inside your browser sandbox. No relay servers, no background uploads, no telemetry on file contents.",
      icon: Lock,
    },
    {
      title: "Native speed",
      body: "Tools share a WebAssembly core tuned for streaming throughput. Hundred-page documents stay responsive on modest hardware.",
      icon: Zap,
    },
    {
      title: "Offline first",
      body: "Install the PWA or download the desktop build. Works in airplane mode, on flaky networks, or air-gapped machines.",
      icon: Globe,
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
    <section class="relative px-5 pb-24 pt-32 md:px-8 md:pt-44 lg:pt-52">
      <div class="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div
          class="flex items-center gap-3"
          in:fade={{ duration: 400, delay: 60 }}
        >
          <span
            class="relative flex size-1.5 items-center justify-center"
            aria-hidden="true"
          >
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-primary/40"
            ></span>
            <span class="relative inline-flex size-1.5 rounded-full bg-primary"
            ></span>
          </span>
          <span
            class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
          >
            v{config.appVersion} · Open preview
          </span>
        </div>

        <h1
          class="max-w-4xl text-display-lg text-foreground sm:text-[3.25rem] sm:leading-[1.05] sm:tracking-[-0.025em] md:text-display-mega"
          in:fly={{ y: 16, duration: 600, delay: 120, easing: cubicOut }}
        >
          A PDF toolkit that works
          <span class="text-primary">entirely on your device.</span>
        </h1>

        <p
          class="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          in:fly={{ y: 12, duration: 520, delay: 220, easing: cubicOut }}
        >
          Edit, convert, sign, and merge documents with a quiet, fast interface
          built for people who care about their files staying their own.
        </p>

        <div
          class="flex flex-wrap items-center gap-2"
          in:fly={{ y: 12, duration: 520, delay: 320, easing: cubicOut }}
        >
          <Button
            href="/explore"
            class="h-12 px-8! shadow-lg shadow-brand transition-all hover:scale-[1.02] bg-brand"
          >
            Start Processing
            <ArrowRight/>
          </Button>
          <Button
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="dark"
            size="lg"
            class="h-12 px-8!"
          >
            <Github size={16} />
            Star on GitHub
          </Button>
        </div>

        <dl
          class="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border/60 pt-10 sm:grid-cols-4"
          in:fade={{ duration: 500, delay: 460 }}
        >
          {#each stats as [val, label], i}
            <div
              class="flex flex-col gap-1"
              in:fly={{
                y: 8,
                duration: 420,
                delay: 480 + i * 60,
                easing: cubicOut,
              }}
            >
              <dt
                class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60"
              >
                {label}
              </dt>
              <dd
                class={`font-mono text-2xl font-medium tabular-nums tracking-tight sm:text-3xl ${i === 0 ? "text-primary" : "text-foreground"}`}
              >
                {val}
              </dd>
            </div>
          {/each}
        </dl>
      </div>
    </section>

    <section id="tools" class="px-5 py-24 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div
          class="mb-10 flex items-baseline justify-between border-b border-border/60 pb-4"
        >
          <div class="flex flex-col gap-2">
            <span
              class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary"
            >
              Tools
            </span>
            <h2
              class="text-display-md text-foreground sm:text-display-lg"
            >
              Eight tools, one quiet interface.
            </h2>
          </div>
          <span
            class="hidden font-mono text-[11px] tabular-nums text-muted-foreground/50 sm:inline"
          >
            01
          </span>
        </div>

        <ul class="flex flex-col">
          {#each displayTools as tool, i (tool.slug)}
            <li>
              <a
                href={`/tools/${tool.slug}`}
                class="group grid grid-cols-[auto_1fr_auto] items-center gap-5 border-b border-border/50 py-5 transition-colors duration-300 hover:bg-muted/30"
              >
                <span
                  class="font-mono text-[11px] tabular-nums text-muted-foreground/50"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div class="flex flex-col gap-1">
                  <span
                    class="text-lg font-medium tracking-tight text-foreground"
                  >
                    {tool.title}
                  </span>
                  <span class="line-clamp-1 text-sm text-muted-foreground">
                    {tool.description.split(". ")[0]}
                  </span>
                </div>
                <ArrowUpRight
                  class="size-4 shrink-0 text-muted-foreground/50 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </a>
            </li>
          {/each}
        </ul>

        <div class="mt-8 flex justify-end">
          <a
            href="/explore"
            class="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span class="relative">
              Browse all tools
              <span
                aria-hidden="true"
                class="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-[width] duration-300 ease-out group-hover:w-full"
              ></span>
            </span>
            <ArrowUpRight class="size-3.5" />
          </a>
        </div>
      </div>
    </section>

    <section class="px-5 py-24 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div
          class="mb-10 flex items-baseline justify-between border-b border-border/60 pb-4"
        >
          <div class="flex flex-col gap-2">
            <span
              class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary"
            >
              Architecture
            </span>
            <h2
              class="max-w-2xl text-display-md text-foreground sm:text-display-lg"
            >
              Privacy is not a setting.
              <span class="text-primary">It is the architecture.</span>
            </h2>
          </div>
          <span
            class="hidden font-mono text-[11px] tabular-nums text-muted-foreground/50 sm:inline"
          >
            02
          </span>
        </div>

        <p class="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          Conventional PDF tools upload your documents to remote servers and
          trust you to read the privacy policy. We engineered a WebAssembly
          pipeline that runs the entire transformation graph locally — so there
          is nothing to upload and nothing to leak.
        </p>

        <ul class="mt-12 grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-3">
          {#each features as feat, i}
            <li
              class="flex flex-col gap-3"
              in:fly={{
                y: 12,
                duration: 480,
                delay: 80 + i * 70,
                easing: cubicOut,
              }}
            >
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex size-7 items-center justify-center rounded-sm bg-primary/10 text-primary"
                >
                  <feat.icon class="size-3.5" />
                </span>
                <span
                  class="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 class="text-lg font-medium tracking-tight text-foreground">
                {feat.title}
              </h3>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {feat.body}
              </p>
            </li>
          {/each}
        </ul>
      </div>
    </section>

    <section class="px-5 pb-32 pt-12 md:px-8">
      <div
        class="mx-auto flex w-full max-w-5xl flex-col items-start gap-6 border-t border-border/60 pt-12 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="max-w-xl">
          <span
            class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            Get started
          </span>
          <h2
            class="mt-3 text-display-md text-foreground sm:text-display-lg"
          >
            Drop a file. Keep your privacy.
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
            No account. No upload. Open a tool, work, close the tab — there is
            nothing left behind.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button href="/#tools" variant="outline" class="rounded-sm">
            See tools
          </Button>
          <Button
            href="/download"
            class="rounded-sm bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
          >
            Download app
            <ArrowUpRight size={16} />
          </Button>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
