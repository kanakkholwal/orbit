<script lang="ts">
  import { page } from "$app/state";
  import { fade } from "svelte/transition";

  import AdUnit from "$components/AdUnit.svelte";
  import ShareButton from "$components/application/ShareButton.svelte";
  import {
    ChevronLeft,
    Info,
    Loader2,
    Share2,
    ShieldCheck,
  } from "@lucide/svelte";
  import type { Component } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const tool = $derived(data.tool);

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
</script>

<svelte:head>
  {#if tool}
    <title>{tool.title} | NexoPDF</title>
    <meta name="description" content={tool.description} />
    <meta property="og:title" content="{tool.title} | Free Online PDF Tool" />
  {/if}
</svelte:head>

{#if tool}
  <div class="min-h-screen w-full bg-background text-foreground" in:fade>
    <div class="mx-auto max-w-app px-4 pb-20 sm:px-6 lg:px-8">
      <nav class="mb-8 flex items-center justify-between">
        <a
          href="/explore"
          class="group flex items-center gap-1 pl-0 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft
            class="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          />
          Back to Directory
        </a>

        <ShareButton
          data={{
            title: tool.title,
            text: `Check out this PDF tool: ${tool.title}`,
            url: page.url.href,
          }}
          variant="dark"
          size="sm"
        >
          <Share2 class="size-3.5" />
          Share
        </ShareButton>
      </nav>

      <div class="flex w-full min-w-0 flex-col gap-8">
        <AdUnit adSlot="display-horizontal" />

        <header
          class="flex flex-col items-start gap-8 px-2 sm:flex-row sm:items-center"
        >
          <div class="relative shrink-0 group hidden md:block">
            <div
              class="absolute inset-0 rounded-full bg-primary/20 blur-2xl opacity-50 transition-opacity group-hover:opacity-70"
            ></div>
            <div
              class="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-4xl border border-border bg-card/80 shadow-xl backdrop-blur-md md:h-28 md:w-28"
            >
              {#if tool.icon}
                {@const Icon = tool.icon}
                <Icon size={48} class={tool.color || "text-foreground"} />
              {/if}
            </div>
          </div>

          <div class="flex-1 space-y-4">
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary"
              >
                {tool.category ?? "Utility"}
              </span>
              <div
                class="flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs font-medium text-green-600 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400"
              >
                <ShieldCheck class="mr-1 h-3 w-3" />
                Client-Side Secure
              </div>
            </div>

            <h1
              class="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-b from-foreground to-foreground/60 md:text-5xl"
            >
              {tool.title}
            </h1>

            <p
              class="max-w-4xl text-base leading-relaxed text-muted-foreground"
            >
              {tool.description}
            </p>
          </div>
        </header>

        <section class="mt-4 w-full max-w-app min-h-100 relative">
          {#if loading}
            <div
              in:fade={{ duration: 200 }}
              out:fade={{ duration: 200 }}
              class="absolute inset-0 w-full h-100 rounded-3xl border-2 border-border bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div
                class="flex flex-col items-center gap-4 opacity-50 animate-pulse"
              >
                <div
                  class="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center"
                >
                  <Loader2 class="size-8 animate-spin text-primary" />
                </div>
                <div class="space-y-2 text-center">
                  <div class="h-4 w-48 bg-muted/50 rounded mx-auto"></div>
                  <div class="h-3 w-32 bg-muted/30 rounded mx-auto"></div>
                </div>
                <div class="h-10 w-36 bg-muted/50 rounded-full mt-4"></div>
              </div>
            </div>
          {:else if ToolComponent}
            <div in:fade={{ duration: 300, delay: 100 }}>
              <ToolComponent />
            </div>
          {/if}
        </section>

        <div class="mt-8">
          <div class="mb-6 flex items-center gap-4">
            <span
              class="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground"
              >Recommended</span
            >
            <div class="h-px flex-1 bg-border"></div>
          </div>
          <AdUnit adSlot="multiplex_horizontal" />
        </div>

        <div class="py-10 text-center">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground"
          >
            <Info class="h-3.5 w-3.5" />
            This tool runs entirely in your browser. No data is sent to our servers.
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
