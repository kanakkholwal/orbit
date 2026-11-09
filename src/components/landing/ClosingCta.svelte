<script lang="ts">
  import { Reveal } from "$components/site";
  import {
    CtaBanner,
    CtaBannerActions,
    CtaBannerBadge,
    CtaBannerContent,
    CtaBannerFloater,
    CtaBannerGrain,
    CtaBannerNote,
    CtaBannerTitle,
    BANNER_SPOTS,
  } from "$components/blocks/cta-banner";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as Github, IconShieldLock as ShieldLock } from "$lib/icons";
  import { toolList } from "$tools/list";

  const floaters = BANNER_SPOTS.map((spot, i) => ({ spot, tool: toolList[i * 3] ?? toolList[0] }));
</script>

<CtaBanner variant="grain" class="w-full">
  <CtaBannerGrain />
  {#each floaters as { spot, tool }, i (tool.slug + i)}
    <CtaBannerFloater x={spot.x} y={spot.y} delay={spot.delay} duration={6 + i} class={spot.size}>
      <tool.icon />
    </CtaBannerFloater>
  {/each}
  <Reveal>
    <CtaBannerContent class="py-20">
      <CtaBannerBadge><ShieldLock /></CtaBannerBadge>
      <CtaBannerTitle class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        {toolList.length} tools. Zero uploads. Free forever.
      </CtaBannerTitle>
      <CtaBannerActions>
        <Button href="/explore" variant="secondary">Start processing</Button>
        <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="dark">
          Star on GitHub
          <Github />
        </Button>
      </CtaBannerActions>
      <CtaBannerNote>
        No account, no watermark, no upload.
        <strong>Close the tab and nothing is left behind.</strong>
      </CtaBannerNote>
    </CtaBannerContent>
  </Reveal>
</CtaBanner>
