<script lang="ts">
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    IconBrandGithub as Github,
    IconCheck as Check,
  } from "$lib/icons";
  import HeroIllustration from "./HeroIllustration.svelte";
</script>

<div
  class="grid min-h-[60vh] grid-cols-1 gap-10 lg:h-[calc(100svh-10rem)] lg:max-h-195 lg:grid-cols-2 lg:gap-6"
>
  <div class="flex h-full flex-col justify-center py-8 lg:py-0">
    <span
      class="rise flex w-fit items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-xs font-semibold text-foreground"
    >
      <span><span class="text-primary">Includes</span> {toolList.length} tools</span>
      <span class="rounded-sm border border-border bg-background p-1">
        <Check class="size-3.75" />
      </span>
    </span>

    <h1
      style="--i:1"
      class="rise mt-4 text-2xl font-medium text-foreground sm:text-4xl md:text-5xl lg:text-6xl"
    >
      Private <span class="text-primary">PDF</span> <br />
      <span class="text-primary">toolkit</span> for everyone
    </h1>

    <p
      style="--i:2"
      class="rise mt-4 max-w-lg text-xs text-muted-foreground sm:text-sm md:text-base"
    >
      Merge, split, sign, compress and convert without an upload. Every tool runs
      inside the page and saves straight to your disk.
    </p>

    <div class="rise mt-8 flex flex-wrap gap-2 sm:gap-4" style="--i:3">
      <Button href="/explore" variant="default">Start processing</Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="secondary">
        Star on GitHub
        <Github />
      </Button>
    </div>
  </div>

  <div class="rise flex min-h-0 items-center justify-center pb-8 lg:py-16" style="--i:2">
    <HeroIllustration />
  </div>
</div>
