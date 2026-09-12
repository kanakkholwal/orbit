<script lang="ts">
  import { Reveal } from "$components/site";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    IconBrandGithub as Github,
    IconShieldLock as ShieldLock,
  } from "@tabler/icons-svelte";

  const floaters = [
    { x: "10%", y: "20%", size: "size-8", delay: 0 },
    { x: "85%", y: "15%", size: "size-6", delay: 1 },
    { x: "15%", y: "75%", size: "size-7", delay: 2 },
    { x: "80%", y: "70%", size: "size-6.5", delay: 0.5 },
    { x: "50%", y: "10%", size: "size-5.5", delay: 1.5 },
    { x: "25%", y: "40%", size: "size-5", delay: 3 },
  ].map((f, i) => ({ ...f, tool: toolList[i * 3] ?? toolList[0] }));
</script>

<section class="panel-brand relative h-full w-full overflow-hidden rounded-3xl py-24">
  <div aria-hidden="true" class="pointer-events-none absolute inset-0">
    {#each floaters as item, i (item.tool.slug + i)}
      <span
        class="floater absolute text-white/75 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]"
        style:left={item.x}
        style:top={item.y}
        style:animation-duration={`${6 + i}s`}
        style:animation-delay={`${item.delay}s`}
      >
        <item.tool.icon class={item.size} stroke={1.5} />
      </span>
    {/each}
  </div>

  <Reveal class="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
    <span
      class="mb-3 grid size-20 rotate-2 place-items-center rounded-3xl bg-white text-primary shadow-lg"
    >
      <ShieldLock class="size-10" stroke={1.5} />
    </span>
    <h2
      class="cta-title mb-8 text-heading font-medium sm:text-heading-lg md:text-display lg:text-display-xl"
    >
      {toolList.length} tools. Zero uploads. Free forever.
    </h2>

    <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Button href="/explore" variant="ink">
        Start processing
      </Button>
      <Button href={config.github} target="_blank" rel="noopener noreferrer" variant="light">
        Star on GitHub
        <Github />
      </Button>
    </div>

    <p class="mt-8 max-w-md text-body text-white/80">
      No account, no watermark, no upload.
      <span class="mt-2 block font-medium text-white">Close the tab and nothing is left behind.</span>
    </p>
  </Reveal>
</section>

<style>
  .cta-title {
    background: linear-gradient(to bottom, #ffffff, rgb(255 255 255 / 0.75));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .floater {
    opacity: 0.25;
    animation-name: drift;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }

  @keyframes drift {
    0%,
    100% {
      opacity: 0.1;
      transform: translate(0, 0) rotate(0deg);
    }
    50% {
      opacity: 0.4;
      transform: translate(10px, -15px) rotate(10deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floater {
      animation: none;
    }
  }
</style>
