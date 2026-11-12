<script lang="ts">
  import { MorphText } from "$components/text/morph-text";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolList } from "$tools/list";
  import { IconBrandGithub as Github, IconCheck as Check } from "$lib/icons";
  import { MediaQuery } from "svelte/reactivity";
  import HeroIllustration from "./HeroIllustration.svelte";

  const reduceMotion = new MediaQuery("prefers-reduced-motion: reduce");
  const subjects = ["PDFs", "photos", "videos", "audio", "documents", "forms"];
  const total = toolList.filter((t) => !t.alias).length;
</script>

<div class="grid min-h-[60vh] grid-cols-1 gap-10 lg:h-[calc(100svh-10rem)] lg:max-h-195 lg:grid-cols-2 lg:gap-6">
  <div class="flex h-full flex-col justify-center py-8 lg:py-0">
    <span class="rise flex w-fit items-center gap-2 rounded-md border border-border p-0.5 pl-2.5 text-xs font-semibold text-foreground">
      <span><span class="text-primary">{total}</span> tools · free · no upload</span>
      <span class="rounded-sm border border-border bg-background p-1">
        <Check class="size-3.75" />
      </span>
    </span>

    <h1 style="--i:1" class="rise mt-4 text-balance text-4xl font-medium text-foreground sm:text-5xl md:text-6xl">
      <span class="sr-only">Private tools for PDFs, photos, videos, audio, documents and forms</span>
      <span aria-hidden="true">
        Do more with your
        <MorphText words={subjects} index={reduceMotion.current ? 0 : undefined} intervalMs={2600} class="text-primary" />
        <span class="block text-muted-foreground">without uploading them.</span>
      </span>
    </h1>

    <p style="--i:2" class="rise mt-5 max-w-lg text-sm text-muted-foreground md:text-base">
      Compress, resize, convert, sign and edit on your own device. Fit a photo to a form, shrink a video, merge a PDF or turn a Word file
      into Markdown, with no account, no watermark and no waiting on a server.
    </p>

    <div class="rise mt-8 flex flex-wrap gap-2 sm:gap-3" style="--i:3">
      <Button href="/explore" variant="default" size="lg">Explore all tools</Button>
      <Button href="/download" variant="outline" size="lg">Get the desktop app</Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="ghost" size="lg">
        <Github />
        Star on GitHub
      </Button>
    </div>
  </div>

  <div class="rise flex min-h-0 items-center justify-center pb-8 lg:py-16" style="--i:2">
    <HeroIllustration />
  </div>
</div>
