<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import { PageHero, RailFrame, RailRow } from "$components/site";
  import { articles } from "$constants/articles";
  import { IconArrowRight as ArrowRight } from "@tabler/icons-svelte";

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
</script>

<Seo
  title="PDF Guides: Merge, Compress, Sign and Convert Without Uploading"
  description="Step-by-step guides to merging, compressing, signing, splitting and converting PDFs for free, privately, on your own device."
  keywords={["pdf guides", "how to merge pdf", "how to compress pdf", "how to sign pdf", "pdf tips", "pdf tutorials"]}
  isBase
/>

<RailFrame>
  <RailRow divider={false} label="Articles">
    <PageHero
      badge="Guides"
      title="Get PDF jobs done"
      accent="without uploading"
      lede="Plain-language guides for the PDF tasks people search for most, each one using free tools that keep your files on your device."
    />
  </RailRow>

  <RailRow label="All articles" class="px-3 pb-12 sm:px-6 sm:pb-16">
    <ul class="grid grid-cols-1 gap-3 px-1 sm:grid-cols-2 sm:px-4 lg:grid-cols-3 lg:px-16">
      {#each articles as article (article.slug)}
        <li>
          <a
            href={`/articles/${article.slug}`}
            class="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 outline-none transition-[border-color,box-shadow] duration-200 ease-craft hover:border-border-strong hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span class="text-caption text-muted-foreground">{formatDate(article.published)} · {article.readingMinutes} min read</span>
            <span class="text-body-lg font-medium text-foreground">{article.title}</span>
            <span class="line-clamp-3 text-body text-muted-foreground">{article.description}</span>
            <span class="mt-auto flex items-center gap-1 pt-2 text-body font-medium text-primary">
              Read guide
              <ArrowRight class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </RailRow>
</RailFrame>
