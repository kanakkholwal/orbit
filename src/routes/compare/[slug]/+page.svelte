<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import { BrandPanel, FaqList, PageHero, RailFrame, RailRow, SplitSection } from "$components/site";
  import { ToolCard } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { REVIEWED } from "$constants/alternatives";
  import { config } from "$constants/app";
  import { IconArrowRight as ArrowRight, IconCheck as Check, IconDownload as Download } from "@tabler/icons-svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const alt = $derived(data.alternative);
  const origin = `https://${config.appDomain}`;
  const reviewed = new Date(REVIEWED).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: alt.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: origin },
        { "@type": "ListItem", position: 2, name: "Compare", item: `${origin}/compare` },
        { "@type": "ListItem", position: 3, name: alt.title, item: `${origin}/compare/${alt.slug}` },
      ],
    },
  ]);
</script>

<Seo title={alt.title} description={alt.description} keywords={alt.keywords} {jsonLd} isBase />

<RailFrame>
  <RailRow divider={false} label={`Orbit compared with ${alt.name}`}>
    <PageHero badge={`Compared with ${alt.name}`} title={alt.title} lede={alt.lede}>
      {#snippet actions()}
        <Button href="/explore" variant="primary">
          Try Orbit free
          <ArrowRight />
        </Button>
        <Button href="/download">
          Get the desktop app
          <Download />
        </Button>
      {/snippet}
    </PageHero>
  </RailRow>

  <RailRow label="At a glance">
    <SplitSection
      title="Side by"
      accent="side"
      description={`How Orbit and ${alt.name} handle the things people ask about most.`}
    >
      <div class="flex flex-col gap-3">
        <div class="panel-card overflow-x-auto">
          <table class="w-full min-w-[34rem] border-collapse text-left text-body">
            <caption class="sr-only">Orbit compared with {alt.name}</caption>
            <thead>
              <tr class="border-b border-border">
                <th scope="col" class="w-[30%] px-5 py-4 font-medium text-muted-foreground"><span class="sr-only">Feature</span></th>
                <th scope="col" class="px-5 py-4 font-medium text-foreground">Orbit</th>
                <th scope="col" class="px-5 py-4 font-medium text-foreground">{alt.name}</th>
              </tr>
            </thead>
            <tbody>
              {#each alt.rows as row (row.label)}
                <tr class="border-b border-border last:border-0">
                  <th scope="row" class="px-5 py-4 align-top font-normal text-muted-foreground">{row.label}</th>
                  <td class="px-5 py-4 align-top text-foreground">
                    <span class="flex gap-2"><Check class="mt-0.5 size-4 shrink-0 text-primary" />{row.orbit}</span>
                  </td>
                  <td class="px-5 py-4 align-top text-foreground">{row.them}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="text-caption text-muted-foreground">
          Details about {alt.name} summarise its public website as of {reviewed} and can change. Check {alt.name}'s own site for current plans and limits.
        </p>
      </div>
    </SplitSection>
  </RailRow>

  <RailRow label="Why people switch">
    <SplitSection title="Why people" accent="choose Orbit" description="The reasons that come up again and again.">
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {#each alt.whySwitch as item (item.title)}
          <li class="panel-card flex flex-col gap-2 p-6">
            <h3 class="text-body-lg font-medium text-foreground">{item.title}</h3>
            <p class="text-body leading-relaxed text-muted-foreground">{item.body}</p>
          </li>
        {/each}
      </ul>
    </SplitSection>
  </RailRow>

  <RailRow label={`Where ${alt.name} is stronger`}>
    <SplitSection
      title={`When ${alt.name}`}
      accent="is the better pick"
      description="No tool is right for everyone. Here is where the other option does more."
    >
      <ul class="panel-card flex flex-col divide-y divide-border px-6">
        {#each alt.theyWin as item (item)}
          <li class="py-4 text-body leading-relaxed text-foreground">{item}</li>
        {/each}
      </ul>
    </SplitSection>
  </RailRow>

  {#if data.tools.length > 0}
    <RailRow label="Tools to try">
      <SplitSection title="Start with" accent="these tools" description="The jobs people most often come to switch for.">
        <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {#each data.tools as tool, i (tool.slug)}
            <li class="contents"><ToolCard {tool} index={i} delay={null} /></li>
          {/each}
        </ul>
      </SplitSection>
    </RailRow>
  {/if}

  <RailRow label="Questions">
    <SplitSection title="Common" accent="questions">
      <FaqList items={alt.faqs} />
    </SplitSection>
  </RailRow>

  <RailRow label="More comparisons">
    <SplitSection title="Other" accent="comparisons">
      <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {#each data.others as other (other.slug)}
          <li>
            <a
              href={`/compare/${other.slug}`}
              class="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-body text-foreground outline-none transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
            >
              Orbit vs {other.name}
              <ArrowRight class="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
          </li>
        {/each}
      </ul>
    </SplitSection>
  </RailRow>

  <RailRow label="Get started">
    <BrandPanel title="Your files, your device" body="Every Orbit tool is free, with no account, no uploads and no limits.">
      {#snippet actions()}
        <Button href="/explore" variant="ink">Browse all tools <ArrowRight /></Button>
        <Button href="/download" variant="light">Desktop app <Download /></Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
