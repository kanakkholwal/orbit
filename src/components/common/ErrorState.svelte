<script lang="ts">
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import { workspace } from "$stores/workspace.svelte";
  import { getTool, type ToolConfig } from "$tools/list";
  import {
    IconArrowLeft as ArrowLeft,
    IconArrowRight as ArrowRight,
    IconCompass as Compass,
    IconRefresh as Refresh,
    IconSearch as Search,
  } from "@tabler/icons-svelte";

  type Props = {
    status: number;
    message?: string;
    /** `workspace` renders inside the app shell and offers its tool search. */
    context?: "site" | "workspace";
    /** What was missing, used in the 404 headline ("tool", "page"). */
    missing?: string;
    class?: string;
  };

  let { status, message, context = "site", missing = "page", class: className }: Props = $props();

  const POPULAR = ["merge-pdf", "compress-pdf", "edit-pdf", "split-pdf"];
  const popular = POPULAR.map((slug) => getTool(slug)).filter((t): t is ToolConfig => t !== null);

  const notFound = $derived(status === 404);
  const headline = $derived(
    notFound ? `This ${missing} doesn't exist` : status >= 500 ? "Something broke on our side" : "Something went wrong"
  );
  const lede = $derived(
    notFound
      ? "The link may be mistyped, or the page has moved. Every tool is still one search away."
      : "Your files are safe: they never left this device. Reload to try again."
  );
  const detail = $derived(message && message !== "Not Found" && message !== "Internal Error" ? message : null);
</script>

<div class={cn("flex w-full flex-col gap-10", className)}>
  <div class="flex flex-col items-start">
    <span
      class="mb-4 w-fit -rotate-2 rounded-md border border-border bg-background px-2.5 py-1 text-caption font-semibold tabular-nums text-foreground"
    >
      Error {status}
    </span>

    <h1 class="text-balance text-heading-lg font-medium text-foreground md:text-display">{headline}</h1>
    <p class="mt-4 max-w-xl text-pretty text-body text-muted-foreground md:text-body-lg">{lede}</p>

    <div class="mt-8 flex flex-wrap items-center gap-2 sm:gap-3">
      {#if notFound}
        {#if context === "workspace"}
          <Button variant="primary" onclick={() => (workspace.searchOpen = true)}>
            <Search />
            Search tools
          </Button>
        {:else}
          <Button variant="primary" href="/explore">
            <Compass />
            Browse tools
          </Button>
        {/if}
        <Button variant="outline" onclick={() => (history.length > 1 ? history.back() : location.assign("/"))}>
          <ArrowLeft />
          Go back
        </Button>
      {:else}
        <Button variant="primary" onclick={() => location.reload()}>
          <Refresh />
          Reload
        </Button>
        <Button variant="outline" href={context === "workspace" ? "/home" : "/"}>Go home</Button>
      {/if}
    </div>

    {#if detail}
      <details class="group mt-6 w-full max-w-xl">
        <summary
          class="w-fit cursor-pointer list-none rounded-md text-body text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"
        >
          <span class="group-open:hidden">Show error details</span>
          <span class="hidden group-open:inline">Hide error details</span>
        </summary>
        <pre
          class="scrollbar-subtle mt-3 overflow-x-auto rounded-lg border border-border bg-muted px-3 py-2.5 font-mono text-caption leading-relaxed text-foreground">{detail}</pre>
      </details>
    {/if}
  </div>

  {#if notFound && popular.length > 0}
    <section class="flex flex-col gap-3" aria-labelledby="error-popular">
      <h2 id="error-popular" class="text-body font-medium text-muted-foreground">Popular tools</h2>
      <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {#each popular as tool (tool.slug)}
          <li>
            <a
              href={`/tools/${tool.slug}`}
              class="group flex items-center gap-3 rounded-xl border border-border bg-card p-2.5 pr-3 outline-none transition-[border-color,box-shadow] duration-200 ease-craft hover:border-border-strong hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span
                class="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-200 group-hover:text-primary"
              >
                <tool.icon class="size-4.5" />
              </span>
              <span class="min-w-0 flex-1 truncate text-body font-medium text-foreground">{tool.title}</span>
              <ArrowRight
                class="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-craft group-hover:translate-x-0.5"
              />
            </a>
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <p class="text-body text-muted-foreground">
    Still stuck?
    <a href={`mailto:${config.supportEmail}`} class="font-medium text-foreground underline-offset-4 hover:underline">
      Email support
    </a>
  </p>
</div>
