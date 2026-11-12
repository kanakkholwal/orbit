<script lang="ts">
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as Github, IconHeart as Heart } from "$lib/icons";
</script>

<!-- A gray tray with one white card inside, then a line of text and the actions. -->
<div class="rise flex flex-col gap-4 rounded-2xl bg-muted/60 p-1.5">
  <div class="flex flex-col gap-3 rounded-xl border border-border bg-background p-6 md:p-8">
    <h2 class="text-balance text-3xl font-medium text-foreground md:text-4xl">Drop a file, pick a job, save the result.</h2>
    <p class="max-w-xl text-pretty text-sm text-muted-foreground md:text-base">
      Orbit is free and open source. There is no account, no watermark and no upload, and once it has loaded it keeps working offline.
    </p>
  </div>

  <div class="flex flex-col gap-3 px-3 pb-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-muted-foreground">Questions or ideas for a tool? <a class="text-foreground underline underline-offset-4" href={`mailto:${config.supportEmail}`}>Write to us</a>.</p>
    <div class="flex flex-wrap gap-2">
      <Button href="/explore">Explore all tools</Button>
      <Button href="/download" variant="outline">Get the desktop app</Button>
      <Button href={config.sponsor} target="_blank" rel="noopener noreferrer" variant="ghost">
        <Heart />
        Sponsor
      </Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="ghost" size="icon" aria-label="GitHub">
        <Github />
      </Button>
    </div>
  </div>
</div>
