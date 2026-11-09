<script lang="ts">
  import { Reveal } from "$components/site";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as Github, IconShieldLock as ShieldLock } from "$lib/icons";
  import { toolList } from "$tools/list";
</script>

<section class="relative w-full overflow-hidden rounded-2xl bg-primary py-20 text-primary-foreground">
  <Reveal class="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
    <span class="mb-4 grid size-14 place-items-center rounded-xl bg-background text-primary">
      <ShieldLock class="size-8" />
    </span>
    <h2 class="mb-8 text-3xl font-medium text-primary-foreground sm:text-4xl md:text-5xl">
      {toolList.length} tools. Zero uploads. Free forever.
    </h2>

    <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
      <Button href="/explore" variant="secondary">Start processing</Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="outline">
        Star on GitHub
        <Github />
      </Button>
    </div>

    <p class="mt-8 max-w-md text-sm text-primary-foreground/80">
      No account, no watermark, no upload.
      <span class="mt-2 block font-medium text-primary-foreground">
        Close the tab and nothing is left behind.
      </span>
    </p>
  </Reveal>
</section>
