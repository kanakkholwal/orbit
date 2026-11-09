<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import { PageHero, RailFrame, RailRow } from "$components/site";
  import { ALTERNATIVES } from "$constants/alternatives";
  import { IconArrowRight as ArrowRight } from "$lib/icons";

  const keywords = ALTERNATIVES.flatMap((a) => a.keywords.slice(0, 2)).concat(["best free pdf tools", "private pdf tools compared"]);
</script>

<Seo
  title="Orbit Compared: iLovePDF, Smallpdf, Adobe and More"
  description="Honest comparisons of Orbit with iLovePDF, Smallpdf, Adobe Acrobat online, Sejda, PDF24 and iHatePDF: privacy, limits, price and features."
  {keywords}
  isBase
/>

<RailFrame>
  <RailRow divider={false} label="Compare">
    <PageHero
      badge="Honest comparisons"
      title="How Orbit compares"
      accent="with other PDF tools"
      lede="Every PDF tool makes trade-offs. These pages show where Orbit is different, and where another tool may suit you better."
    />
  </RailRow>

  <RailRow label="All comparisons" class="px-3 pb-12 sm:px-6 sm:pb-16">
    <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each ALTERNATIVES as alt (alt.slug)}
        <li>
          <a
            href={`/compare/${alt.slug}`}
            class="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-background p-5 outline-none transition-[border-color,box-shadow] duration-(--duration-base) ease-(--ease-ui-out) hover:border-border-strong hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span class="text-xs font-medium text-muted-foreground">Orbit vs {alt.name}</span>
            <span class="text-base font-medium text-foreground">{alt.title}</span>
            <span class="line-clamp-2 text-sm text-muted-foreground">{alt.description}</span>
            <span class="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-primary">
              Read comparison
              <ArrowRight class="size-4 transition-transform duration-(--duration-base) group-hover:translate-x-0.5" />
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </RailRow>
</RailFrame>
