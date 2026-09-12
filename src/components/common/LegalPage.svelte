<script lang="ts">
  import { PageHero, RailFrame, RailRow } from "$components/site";

  interface LegalSection {
    heading: string;
    paragraphs?: string[];
    list?: string[];
  }

  let {
    eyebrow = "Legal",
    title,
    intro,
    updated,
    sections,
  }: {
    eyebrow?: string;
    title: string;
    intro: string;
    updated: string;
    sections: LegalSection[];
  } = $props();

  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
</script>

<RailFrame>
  <RailRow divider={false} label={title}>
    <PageHero badge={`${eyebrow} · Updated ${updated}`} {title} lede={intro} />
  </RailRow>

  <RailRow label="Contents">
    <div class="flex flex-col gap-10 px-1 py-6 sm:px-4 sm:py-8 lg:flex-row lg:gap-20 lg:px-16 lg:py-10">
      <aside class="shrink-0 lg:w-64">
        <nav class="panel-card flex flex-col p-2 lg:sticky lg:top-28" aria-label="On this page">
          {#each sections as section, i (section.heading)}
            <a
              href={`#${slug(section.heading)}`}
              class="flex items-baseline gap-3 rounded-lg px-3 py-2 text-body text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <span class="text-caption tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {section.heading}
            </a>
          {/each}
        </nav>
      </aside>

      <article class="panel-card min-w-0 flex-1 divide-y divide-border">
        {#each sections as section, i (section.heading)}
          <section id={slug(section.heading)} class="flex scroll-mt-28 flex-col gap-3 px-6 py-8 sm:px-10">
            <h2 class="flex items-baseline gap-3 text-subheading font-medium text-foreground">
              <span class="text-body font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
              {section.heading}
            </h2>
            {#if section.paragraphs}
              {#each section.paragraphs as p (p)}
                <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">{p}</p>
              {/each}
            {/if}
            {#if section.list}
              <ul class="flex max-w-2xl flex-col gap-2.5">
                {#each section.list as item (item)}
                  <li class="flex gap-3 text-body leading-relaxed text-muted-foreground">
                    <span class="mt-2 size-1.5 shrink-0 rounded-full bg-primary"></span>
                    <span>{item}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </section>
        {/each}
      </article>
    </div>
  </RailRow>
</RailFrame>
