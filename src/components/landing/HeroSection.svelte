<script lang="ts">
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { rise } from "$lib/motion";
  import { toolList } from "$tools/list";
  import {
    IconBrandGithub as Github,
    IconCheck as Check,
  } from "@tabler/icons-svelte";
  import { fly } from "svelte/transition";
  import HeroIllustration from "./HeroIllustration.svelte";
</script>

<div
  class="grid min-h-[60vh] grid-cols-1 gap-10 lg:h-[calc(100svh-10rem)] lg:max-h-195 lg:grid-cols-2 lg:gap-6"
>
  <div class="flex h-full flex-col justify-center py-8 lg:py-0">
    <span
      class="flex w-fit -rotate-2 items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-caption font-semibold text-foreground"
      in:fly={rise(6)}
    >
      <span><span class="text-primary">Includes</span> {toolList.length} tools</span>
      <span class="rounded-sm border border-border bg-background p-1">
        <Check class="size-3.75" />
      </span>
    </span>

    <h1
      class="mt-4 text-heading-sm font-medium text-foreground sm:text-heading-lg md:text-display lg:text-display-xl"
      in:fly={rise(12, 60)}
    >
      Private <span class="text-primary">PDF</span> <br />
      <span class="text-primary">toolkit</span> for everyone
    </h1>

    <p
      class="mt-4 max-w-lg text-caption text-muted-foreground sm:text-body md:text-body-lg"
      in:fly={rise(10, 110)}
    >
      Merge, split, sign, compress and convert without an upload. Every tool runs
      inside the page and saves straight to your disk.
    </p>

    <div class="mt-8 flex flex-wrap gap-2 sm:gap-4" in:fly={rise(10, 160)}>
      <Button href="/explore" variant="primary">Start processing</Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer">
        Star on GitHub
        <Github />
      </Button>
    </div>
  </div>

  <div class="flex min-h-0 items-center justify-center pb-8 lg:py-16" in:fly={rise(16, 120)}>
    <HeroIllustration />
  </div>
</div>
