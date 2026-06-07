<script lang="ts">
  import { page } from "$app/state";
  import AdUnit from "$components/AdUnit.svelte";
  import ShareButton from "$components/application/ShareButton.svelte";
  import Seo from "$components/Seo.svelte";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { getToolContent } from "$constants/tool-content";
  import { toolsCategories } from "$constants/tools";
  import { recordRecentTool } from "$lib/runtime/recent-tools.svelte";
  import { appState } from "$stores/app-state.svelte";
  import {
    ChevronLeft,
    CircleAlert,
    DownloadIcon,
    Github,
    LoaderCircle,
    Share2,
    ShieldCheck,
  } from "@lucide/svelte";
  import { untrack, type Component } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const tool = $derived(data.tool);
  let isTauri = $derived(appState.isTauri);

  let ToolComponent: Component | null = $state(null);
  let loading = $state(true);
  let error = $state(false);

  $effect(() => {
    loading = true;
    ToolComponent = null;
    error = false;
    tool
      .component()
      .then((mod) => {
        ToolComponent = mod.default;
      })
      .catch((e) => {
        console.error("Error loading tool component:", e);
        error = true;
      })
      .finally(() => (loading = false));
  });

  // Record the visit for the workspace "jump back in" row. `untrack` the call
  // so this effect depends ONLY on tool.slug — recordRecentTool both reads and
  // writes the recent-tools state, which would otherwise self-trigger the
  // effect into an infinite update loop.
  $effect(() => {
    const slug = tool?.slug;
    if (slug) untrack(() => recordRecentTool(slug));
  });

  let categoryName = $derived(
    toolsCategories.find((c) => c.id === tool.category)?.name ??
      tool.category ??
      "Utility"
  );

  // Long-form SEO content (how-it-works, use cases, FAQ) + FAQPage structured data.
  let toolContent = $derived(getToolContent(tool));
  let faqJsonLd = $derived(
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: toolContent.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    }).replace(/</g, "\\u003c")
  );
</script>

<svelte:head>
  {@html `<script type="application/ld+json">${faqJsonLd}</` + `script>`}
</svelte:head>

{#if tool}
  <Seo
    title={tool.title + " - Free Online PDF Tool"}
    description={tool.description}
    keywords={tool?.keywords}
  />

  <div class="min-h-screen w-full" in:fade={{ duration: 220 }}>
    <div class="flex flex-col gap-12 px-3 pb-[max(env(safe-area-inset-bottom),2rem)] pt-2 sm:px-5 sm:pt-4">
      <nav
        class="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5"
        aria-label="Tool toolbar"
        in:fly={{ y: 8, duration: 380, easing: cubicOut }}
      >
        <a
          href="/explore"
          class="group inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft
            class="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          Back to library
        </a>

        <div class="flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            class="rounded-sm text-muted-foreground hover:text-foreground"
          >
            <Github class="size-3.5" />
            <span class="hidden sm:inline">GitHub</span>
          </Button>
          {#if !isTauri}
            <Button
              variant="ghost"
              size="sm"
              href="/download"
              class="rounded-sm text-muted-foreground hover:text-foreground"
            >
              <DownloadIcon class="size-3.5" />
              <span class="hidden sm:inline">Desktop</span>
            </Button>
          {/if}
          <ShareButton
            data={{
              title: tool.title,
              text: `Check out this PDF tool: ${tool.title}`,
              url: page.url.href,
            }}
            variant="outline"
            size="sm"
            class="rounded-sm"
          >
            <Share2 class="size-3.5" />
            <span class="hidden sm:inline">Share</span>
          </ShareButton>
        </div>
      </nav>

      <header
        class="flex flex-col gap-5"
        in:fly={{ y: 10, duration: 480, delay: 60, easing: cubicOut }}
      >
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-primary"
          >
            Tool
          </span>
          <span class="text-muted-foreground/40">·</span>
          <span
            class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            {categoryName}
          </span>
          <span class="text-muted-foreground/40">·</span>
          <span class="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground/80">
            <ShieldCheck class="size-3 text-primary" />
            Client-side
          </span>
        </div>

        <div class="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <div
            class="hidden size-14 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary sm:inline-flex"
          >
            {#if tool.icon}
              {@const Icon = tool.icon}
              <Icon class="size-6" />
            {/if}
          </div>

          <div class="flex flex-col gap-3">
            <h1
              class="text-display-md font-semibold text-foreground sm:text-display-lg"
            >
              {tool.title}
            </h1>
            <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>
      </header>

      {#key tool.slug}
        <AdUnit adSlot="display-horizontal" />
      {/key}

      <section
        aria-label="Tool workspace"
        class="relative min-h-104"
        in:fly={{ y: 12, duration: 520, delay: 120, easing: cubicOut }}
      >
        {#if loading}
          <div
            in:fade={{ duration: 200 }}
            out:fade={{ duration: 200 }}
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md border border-dashed border-border/60 bg-muted/20"
          >
            <span class="inline-flex size-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <LoaderCircle class="size-4 animate-spin" />
            </span>
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
              Loading tool
            </p>
            <p class="text-sm text-muted-foreground">
              Spinning up the {tool.title.toLowerCase()} workspace…
            </p>
          </div>
        {:else if error}
          <div
            in:fade={{ duration: 200 }}
            class="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md border border-destructive/30 bg-destructive/5 px-6 text-center"
          >
            <span class="inline-flex size-10 items-center justify-center rounded-sm bg-destructive/10 text-destructive">
              <CircleAlert class="size-4" />
            </span>
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-destructive">
              Failed to load
            </p>
            <p class="max-w-sm text-sm text-muted-foreground">
              Something went wrong while loading
              <span class="font-medium text-foreground">{tool.title}</span>.
              Refresh or pick another tool.
            </p>
            <div class="mt-2 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onclick={() => window.location.reload()}
                class="rounded-sm"
              >
                Try again
              </Button>
              <Button
                variant="ghost"
                size="sm"
                href="/explore"
                class="rounded-sm text-muted-foreground hover:text-foreground"
              >
                Browse tools
              </Button>
            </div>
          </div>
        {:else if ToolComponent}
          <div in:fade={{ duration: 280, delay: 60 }}>
            <ToolComponent />
          </div>
        {/if}
      </section>

      <article class="flex flex-col gap-16">
        <!-- Intro -->
        <section class="flex flex-col gap-4">
          <span class="label-eyebrow text-primary">About {tool.title}</span>
          <p class="max-w-3xl text-lg leading-relaxed text-foreground/90">
            {toolContent.intro}
          </p>
        </section>

        <!-- How it works -->
        <section class="flex flex-col gap-6">
          <header class="flex flex-col gap-2 border-b border-border/60 pb-4">
            <span class="label-eyebrow text-muted-foreground">How it works</span>
            <h2 class="text-display-md text-foreground">
              {tool.title} in a few steps
            </h2>
          </header>
          <ol class="flex flex-col gap-5">
            {#each toolContent.howItWorks as step, i (i)}
              <li class="flex gap-4">
                <span
                  class="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[12px] tabular-nums text-primary"
                >
                  {i + 1}
                </span>
                <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {step}
                </p>
              </li>
            {/each}
          </ol>
        </section>

        <!-- Use cases -->
        <section class="flex flex-col gap-6">
          <header class="flex flex-col gap-2 border-b border-border/60 pb-4">
            <span class="label-eyebrow text-muted-foreground">Use cases</span>
            <h2 class="text-display-md text-foreground">
              What {tool.title} is good for
            </h2>
          </header>
          <ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {#each toolContent.useCases as uc (uc.title)}
              <li
                class="flex flex-col gap-2 rounded-lg border border-border bg-card p-5"
              >
                <h3 class="text-title-sm text-foreground">{uc.title}</h3>
                <p class="text-sm leading-relaxed text-muted-foreground">
                  {uc.body}
                </p>
              </li>
            {/each}
          </ul>
        </section>

        <!-- FAQ -->
        <section class="flex flex-col gap-6">
          <header class="flex flex-col gap-2 border-b border-border/60 pb-4">
            <span class="label-eyebrow text-muted-foreground">FAQ</span>
            <h2 class="text-display-md text-foreground">
              Frequently asked questions
            </h2>
          </header>
          <dl class="flex flex-col divide-y divide-border/60">
            {#each toolContent.faqs as faq (faq.q)}
              <div class="flex flex-col gap-2 py-5 first:pt-0">
                <dt class="text-title-sm text-foreground">{faq.q}</dt>
                <dd class="max-w-3xl text-base leading-relaxed text-muted-foreground">
                  {faq.a}
                </dd>
              </div>
            {/each}
          </dl>
        </section>
      </article>

      <section class="flex flex-col gap-6">
        <div class="flex items-baseline justify-between gap-3 border-b border-border/60 pb-3">
          <span class="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Recommended
          </span>
          <span class="font-mono text-[11px] tabular-nums text-muted-foreground/50">
            {String(data.recommended.length).padStart(2, "0")}
          </span>
        </div>

        {#key tool.slug}
          <AdUnit adSlot="multiplex_horizontal" />
        {/key}

        <ul
          class="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3"
        >
          {#each data.recommended as rec, i (rec.slug)}
            <li class="contents">
              <ToolCard tool={rec} index={i} delay={60 + i * 40} />
            </li>
          {/each}
        </ul>
      </section>

      <div
        class="mt-2 flex flex-col items-center gap-2 border-t border-border/60 pt-8 text-center"
      >
        <p
          class="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60"
        >
          Privacy by architecture
        </p>
        <p class="text-xs text-muted-foreground">
          This tool runs entirely in your {appState.isTauri ? 'device' : 'browser'}. Nothing is sent to a server.
        </p>
      </div>
    </div>
  </div>
{/if}
