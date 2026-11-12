<script lang="ts">
  import AdUnit from "$components/AdUnit.svelte";
  import Seo from "$components/Seo.svelte";
  import { FaqList } from "$components/site";
  import { ToolCard, ToolHeader } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { getToolContent } from "$constants/tool-content";
  import { warmEnginesForTool } from "$lib/engine-warmup";
  import { recordRecentTool } from "$lib/runtime/recent-tools.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconAlertCircle as CircleAlert, IconLoader2 as Loader } from "$lib/icons";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const tool = $derived(data.tool);
  const layout = $derived(tool.layout ?? "form");
  const showGuide = $derived(!appState.isTauri && layout !== "immersive");

  // One promise per slug; {#await} only ever renders the latest, so a slow import can't resurface.
  const toolModule = $derived(tool.component());

  // untrack: recordRecentTool reads and writes the same state, which would re-trigger this effect.
  $effect(() => {
    const slug = tool?.slug;
    if (slug) untrack(() => recordRecentTool(slug));
  });

  $effect(() => {
    const slug = tool?.slug;
    if (!slug) return;

    let cancel = () => {};
    toolModule.then(() => {
      cancel = warmEnginesForTool(slug);
    }).catch(() => {});

    return () => cancel();
  });

  const base = $derived(getToolContent(tool));
  const pair = $derived(data.pair);
  const toolContent = $derived({
    ...base,
    faqs: pair
      ? [
          {
            q: `How do I convert back with ${pair.title}?`,
            a: `Use the ${pair.title} tool on Orbit. It does the reverse conversion, is free, and also runs entirely in your browser, so the file is not uploaded.`,
          },
          ...base.faqs,
        ]
      : base.faqs,
  });
  const origin = `https://${config.appDomain}`;
  const jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: tool.title,
      description: tool.description,
      url: `${origin}/tools/${tool.slug}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser",
      isAccessibleForFree: true,
      featureList: ["Runs in your browser", "No upload", "No watermark", "No account", "Works offline after first load"],
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      ...(pair ? { isRelatedTo: { "@type": "WebApplication", name: pair.title, url: `${origin}/tools/${pair.slug}` } } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Tools", item: `${origin}/explore` },
        { "@type": "ListItem", position: 2, name: tool.title, item: `${origin}/tools/${tool.slug}` },
      ],
    },
    ...(showGuide
      ? [
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: `How to use ${tool.title}`,
            totalTime: "PT1M",
            step: toolContent.howItWorks.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: toolContent.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          },
        ]
      : []),
  ]);
</script>

<Seo title={tool.seoTitle ?? `${tool.title}: Free, No Upload, No Watermark`} description={tool.description} keywords={tool.keywords} {jsonLd} />

{#snippet toolBody()}
  {#key tool.slug}
    {#await toolModule}
      <div class="flex h-full min-h-80 flex-col items-center justify-center gap-3" in:fade={{ duration: 150 }}>
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-sm text-muted-foreground">Opening {tool.title}</p>
      </div>
    {:then mod}
      <mod.default slug={tool.slug} />
    {:catch}
      <div class="flex h-full min-h-80 flex-col items-center justify-center gap-3 px-6 text-center" in:fade={{ duration: 150 }}>
        <CircleAlert class="size-5 text-destructive" />
        <p class="text-sm font-medium text-foreground">{tool.title} didn't load</p>
        <p class="max-w-sm text-sm text-muted-foreground">Check your connection, then try again.</p>
        <div class="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onclick={() => window.location.reload()}>Try again</Button>
          <Button variant="ghost" size="sm" href="/explore">Browse tools</Button>
        </div>
      </div>
    {/await}
  {/key}
{/snippet}

{#if layout === "immersive"}
  <div class="h-full min-h-0 overflow-clip">
    <h1 class="sr-only">{tool.title}</h1>
    {@render toolBody()}
  </div>
{:else}
  <div class="flex min-h-full flex-col">
    <section
      aria-label={`${tool.title} workspace`}
      class={cn(
        "w-full min-h-[80dvh] flex-1 px-3 py-4 sm:px-6 sm:py-6",
        layout === "form" ? "mx-auto max-w-5xl" : "mx-auto max-w-7xl"
      )}
    >
      <ToolHeader {tool} />
      {@render toolBody()}
    </section>

    {#if showGuide}
      <div class="border-t border-border bg-background">
        <div class="mx-auto flex w-full max-w-7xl flex-col gap-14 px-3 py-12 sm:px-6 *:max-w-5xl">
          <section class="flex flex-col gap-3">
            <h2 class="text-2xl font-medium text-foreground">About {tool.title}</h2>
            <p class="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{toolContent.intro}</p>
          </section>

          <section class="flex flex-col gap-5">
            <h2 class="text-2xl font-medium text-foreground">How it works</h2>
            <ol class="flex flex-col gap-3">
              {#each toolContent.howItWorks as step, i (i)}
                <li class="rounded-2xl border border-border bg-background p-1">
                  <div class="flex gap-4 rounded-[11px] bg-card px-5 py-4">
                    <span class="text-sm font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <p class="text-sm leading-relaxed text-muted-foreground">{step}</p>
                  </div>
                </li>
              {/each}
            </ol>
          </section>

          {#if pair}
            <a
              href={`/tools/${pair.slug}`}
              class="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-1 outline-none transition-colors duration-(--duration-base) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span class="flex flex-1 flex-col gap-1 rounded-[11px] bg-card p-5">
                <span class="text-xs text-muted-foreground">Need the reverse?</span>
                <span class="text-base font-medium text-foreground">{pair.title}</span>
                <span class="text-sm text-muted-foreground">{pair.description}</span>
              </span>
            </a>
          {/if}
          {#key tool.slug}
            <AdUnit adSlot="display-horizontal" />
          {/key}

          <section class="flex flex-col gap-5">
            <h2 class="text-2xl font-medium text-foreground">What it's good for</h2>
            <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {#each toolContent.useCases as uc (uc.title)}
                <li class="rounded-2xl border border-border bg-background p-1">
                  <div class="flex h-full flex-col gap-2 rounded-[11px] bg-card p-5">
                    <h3 class="text-base font-medium text-foreground">{uc.title}</h3>
                    <p class="text-sm leading-relaxed text-muted-foreground">{uc.body}</p>
                  </div>
                </li>
              {/each}
            </ul>
          </section>

          <section class="flex flex-col gap-5">
            <h2 class="text-2xl font-medium text-foreground">Questions</h2>
            <FaqList items={toolContent.faqs} variant="cards" />
          </section>

          {#if data.recommended.length > 0}
            <section class="flex flex-col gap-5">
              <h2 class="text-2xl font-medium text-foreground">Related tools</h2>
              <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {#each data.recommended as rec, i (rec.slug)}
                  <li class="contents">
                    <ToolCard tool={rec} index={i} delay={null} />
                  </li>
                {/each}
              </ul>
            </section>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}
