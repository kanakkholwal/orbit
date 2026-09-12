<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import { RailFrame, RailRow } from "$components/site";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconArrowLeft as ArrowLeft, IconArrowRight as ArrowRight } from "@tabler/icons-svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const article = $derived(data.article);
  const primary = $derived(data.tools[0]);
  const origin = `https://${config.appDomain}`;
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin },
        { "@type": "ListItem", position: 2, name: "Articles", item: `${origin}/articles` },
        { "@type": "ListItem", position: 3, name: article.title, item: `${origin}/articles/${article.slug}` },
      ],
    },
  ]);
</script>

<Seo
  title={article.title}
  description={article.description}
  keywords={article.keywords}
  type="article"
  publishedTime={article.published}
  modifiedTime={article.updated ?? article.published}
  {jsonLd}
/>

<RailFrame>
  <RailRow divider={false} label="Article" class="px-3 pb-10 pt-28 sm:px-6 sm:pt-32">
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-1 sm:px-4 lg:px-10">
      <header class="flex max-w-3xl flex-col gap-4">
        <a href="/articles" class="flex w-fit items-center gap-1.5 rounded-md text-body text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft class="size-4" />
          All articles
        </a>
        <h1 class="text-balance text-heading-lg font-medium text-foreground md:text-display">{article.title}</h1>
        <p class="text-pretty text-body-lg text-muted-foreground">{article.description}</p>
        <p class="text-body text-muted-foreground">
          <time datetime={article.updated ?? article.published}>{formatDate(article.updated ?? article.published)}</time>
          · {article.readingMinutes} min read
        </p>
      </header>

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <article class="article-body min-w-0 max-w-3xl">
          {@html data.html}
        </article>

        <aside class="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
          {#if primary}
            <div class="panel-card flex flex-col gap-3 p-5">
              <span class="grid size-10 place-items-center rounded-lg border border-border bg-background text-primary">
                <primary.icon class="size-5" />
              </span>
              <p class="text-body-lg font-medium text-foreground">{primary.title}</p>
              <p class="text-body text-muted-foreground">Free, no upload, no account. Your file stays on your device.</p>
              <Button href={`/tools/${primary.slug}`} variant="primary" class="w-full">
                Open {primary.title}
                <ArrowRight />
              </Button>
            </div>
          {/if}
          {#if data.toc.length > 1}
            <nav aria-label="On this page" class="hidden flex-col gap-1 lg:flex">
              <p class="pb-1 text-caption font-medium text-muted-foreground">On this page</p>
              {#each data.toc as item (item.id)}
                <a href={`#${item.id}`} class="rounded-md py-1 text-body text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{item.text}</a>
              {/each}
            </nav>
          {/if}
        </aside>
      </div>
    </div>
  </RailRow>

  {#if data.related.length > 0}
    <RailRow label="Keep reading" class="px-3 py-12 sm:px-6">
      <div class="mx-auto flex w-full max-w-6xl flex-col gap-5 px-1 sm:px-4 lg:px-10">
        <h2 class="text-heading-sm font-medium text-foreground">Keep reading</h2>
        <ul class="grid grid-cols-1 gap-3 md:grid-cols-3">
          {#each data.related as item (item.slug)}
            <li>
              <a
                href={`/articles/${item.slug}`}
                class="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span class="text-body-lg font-medium text-foreground">{item.title}</span>
                <span class="line-clamp-2 text-body text-muted-foreground">{item.description}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </RailRow>
  {/if}
</RailFrame>

<style>
  .article-body {
    color: var(--foreground);
    font-size: 1rem;
    line-height: 1.75;
  }
  .article-body :global(h2) {
    margin: 2.5rem 0 0.75rem;
    font-family: var(--font-heading);
    font-size: 1.5rem;
    line-height: 1.3;
    font-weight: 500;
    scroll-margin-top: 7rem;
  }
  .article-body :global(h3) {
    margin: 1.75rem 0 0.5rem;
    font-family: var(--font-heading);
    font-size: 1.125rem;
    line-height: 1.4;
    font-weight: 500;
  }
  .article-body :global(:first-child) {
    margin-top: 0;
  }
  .article-body :global(p),
  .article-body :global(ul),
  .article-body :global(ol) {
    margin: 0 0 1.1rem;
    color: var(--muted-foreground);
  }
  .article-body :global(strong) {
    color: var(--foreground);
    font-weight: 600;
  }
  .article-body :global(ul),
  .article-body :global(ol) {
    padding-left: 1.25rem;
  }
  .article-body :global(ul) {
    list-style: disc;
  }
  .article-body :global(ol) {
    list-style: decimal;
  }
  .article-body :global(li) {
    margin-bottom: 0.4rem;
    padding-left: 0.25rem;
  }
  .article-body :global(li::marker) {
    color: var(--primary);
  }
  .article-body :global(a) {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 1px;
  }
  .article-body :global(a:hover) {
    text-decoration-thickness: 2px;
  }
  .article-body :global(blockquote) {
    margin: 1.5rem 0;
    padding: 0.25rem 0 0.25rem 1rem;
    border-left: 3px solid var(--primary);
  }
  .article-body :global(code) {
    padding: 0.1rem 0.35rem;
    border-radius: 0.375rem;
    background: var(--muted);
    font-family: var(--font-mono);
    font-size: 0.875em;
  }
  .article-body :global(table) {
    display: block;
    width: 100%;
    overflow-x: auto;
    margin: 1.5rem 0;
    border-collapse: collapse;
    font-size: 0.9375rem;
  }
  .article-body :global(th),
  .article-body :global(td) {
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid var(--border);
    text-align: left;
    vertical-align: top;
  }
  .article-body :global(th) {
    color: var(--foreground);
    font-weight: 500;
  }
  .article-body :global(hr) {
    margin: 2.5rem 0;
    border: 0;
    border-top: 1px solid var(--border);
  }
</style>
