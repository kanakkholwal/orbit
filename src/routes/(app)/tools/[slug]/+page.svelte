<script lang="ts">
  import AdUnit from "$components/AdUnit.svelte";
  import Seo from "$components/Seo.svelte";
  import { FaqList } from "$components/site";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { getToolContent } from "$constants/tool-content";
  import { recordRecentTool } from "$lib/runtime/recent-tools.svelte";
  import { cn } from "$lib/utils";
  import { appState } from "$stores/app-state.svelte";
  import { IconAlertCircle as CircleAlert, IconLoader2 as Loader } from "@tabler/icons-svelte";
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

  const toolContent = $derived(getToolContent(tool));
  const faqJsonLd = $derived(
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
  {#if showGuide}
    {@html `<script type="application/ld+json">${faqJsonLd}</` + `script>`}
  {/if}
</svelte:head>

<Seo title={tool.seoTitle ?? `${tool.title} - Free Online PDF Tool`} description={tool.description} keywords={tool?.keywords} />

{#snippet toolBody()}
  {#key tool.slug}
    {#await toolModule}
      <div class="flex h-full min-h-80 flex-col items-center justify-center gap-3" in:fade={{ duration: 150 }}>
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-body text-muted-foreground">Opening {tool.title}</p>
      </div>
    {:then mod}
      <mod.default />
    {:catch}
      <div class="flex h-full min-h-80 flex-col items-center justify-center gap-3 px-6 text-center" in:fade={{ duration: 150 }}>
        <CircleAlert class="size-5 text-destructive" />
        <p class="text-body font-medium text-foreground">{tool.title} didn't load</p>
        <p class="max-w-sm text-body text-muted-foreground">Check your connection, then try again.</p>
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
    {@render toolBody()}
  </div>
{:else}
  <div class="flex min-h-full flex-col">
    <section
      aria-label={`${tool.title} workspace`}
      class={cn(
        "w-full min-h-[80dvh] flex-1 px-3 py-4 sm:px-6 sm:py-6",
        layout === "form" && "mx-auto max-w-5xl"
      )}
    >
      {@render toolBody()}
    </section>

    {#if showGuide}
      <div class="border-t border-border bg-canvas">
        <div class="mx-auto flex w-full max-w-5xl flex-col gap-14 px-3 py-12 sm:px-6">
          {#key tool.slug}
            <AdUnit adSlot="display-horizontal" />
          {/key}

          <section class="flex flex-col gap-3">
            <h2 class="text-heading-sm font-medium text-foreground">About {tool.title}</h2>
            <p class="max-w-3xl text-body leading-relaxed text-muted-foreground md:text-body-lg">{toolContent.intro}</p>
          </section>

          <section class="flex flex-col gap-5">
            <h2 class="text-heading-sm font-medium text-foreground">How it works</h2>
            <ol class="flex flex-col gap-3">
              {#each toolContent.howItWorks as step, i (i)}
                <li class="panel-card flex gap-4 px-5 py-4">
                  <span class="text-body font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <p class="text-body leading-relaxed text-muted-foreground">{step}</p>
                </li>
              {/each}
            </ol>
          </section>

          <section class="flex flex-col gap-5">
            <h2 class="text-heading-sm font-medium text-foreground">What it's good for</h2>
            <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {#each toolContent.useCases as uc (uc.title)}
                <li class="panel-card flex flex-col gap-2 p-5">
                  <h3 class="text-body-lg font-medium text-foreground">{uc.title}</h3>
                  <p class="text-body leading-relaxed text-muted-foreground">{uc.body}</p>
                </li>
              {/each}
            </ul>
          </section>

          <section class="flex flex-col gap-5">
            <h2 class="text-heading-sm font-medium text-foreground">Questions</h2>
            <FaqList items={toolContent.faqs} variant="cards" />
          </section>

          {#if data.recommended.length > 0}
            <section class="flex flex-col gap-5">
              <h2 class="text-heading-sm font-medium text-foreground">Related tools</h2>
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
