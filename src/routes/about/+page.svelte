<script lang="ts">
  import { BrandPanel, PageHero, RailFrame, RailRow, SplitSection } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import {
    IconBrandGithub as Github,
    IconFeather as Feather,
    IconHeartHandshake as Handshake,
    IconLock as Lock,
    IconMail as Mail,
    IconSparkles as Sparkles,
  } from "@tabler/icons-svelte";

  const principles = [
    {
      icon: Lock,
      title: "Your files stay with you",
      body: "Every tool works inside your browser or the desktop app. Documents are never uploaded, stored or looked at.",
    },
    {
      icon: Feather,
      title: "Quiet and quick",
      body: "No sign-up walls, no waiting in a queue, and nothing ever sits between you and your file. Open a tool, finish the job, close the tab.",
    },
    {
      icon: Handshake,
      title: "Open for anyone to check",
      body: "The code is public and free to use. Anyone can confirm that Orbit does exactly what it says.",
    },
    {
      icon: Sparkles,
      title: "Fewer tools, done well",
      body: "We would rather ship a smaller set of tools that work beautifully than a long menu of half-finished ones.",
    },
  ];

  const facts = [
    ["Price", "Free, forever"],
    ["Account", "Not needed"],
    ["Watermarks", "Never"],
    ["Works offline", "Yes, once installed"],
    ["Source code", "Public on GitHub"],
  ];
</script>

<Seo
  title="About"
  description={`The story and principles behind ${config.appName}, a private PDF toolkit that runs entirely on your device.`}
  keywords={["about orbit pdf", "privacy first pdf tool", "open source pdf editor"]}
/>

<RailFrame>
  <RailRow divider={false} label="About Orbit">
    <PageHero
      badge="Free and open source"
      title="A PDF toolkit that"
      accent="respects your files"
      lede={`${config.appName} began with a small frustration: PDF sites that are slow, cap how much you can do and are quick to ask for your file. So we built one that keeps your documents on your own device.`}
    >
      {#snippet actions()}
        <Button href="/explore" variant="primary">Try the tools</Button>
        <Button href={config.github} target="_blank" rel="noopener noreferrer">
          Star on GitHub
          <Github />
        </Button>
      {/snippet}
    </PageHero>
  </RailRow>

  <RailRow label="Principles">
    <SplitSection
      title="What we"
      accent="believe in"
      description="Four promises shape every tool we add and every change we make."
    >
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each principles as p (p.title)}
          <li class="panel-card flex flex-col gap-3 p-6">
            <span class="grid size-10 place-items-center rounded-lg border border-border">
              <p.icon class="size-5 text-primary" />
            </span>
            <h3 class="text-body-lg font-medium text-foreground">{p.title}</h3>
            <p class="text-body leading-relaxed text-muted-foreground">{p.body}</p>
          </li>
        {/each}
      </ul>
    </SplitSection>
  </RailRow>

  <RailRow label="At a glance">
    <SplitSection title="At a" accent="glance" description="The short answers to what people ask first.">
      <dl class="panel-card divide-y divide-border px-6">
        {#each facts as [label, value] (label)}
          <div class="flex items-center justify-between gap-4 py-5">
            <dt class="text-body text-muted-foreground">{label}</dt>
            <dd class="text-body-lg font-medium text-foreground">{value}</dd>
          </div>
        {/each}
      </dl>
    </SplitSection>
  </RailRow>

  <RailRow label="Get in touch">
    <BrandPanel
      title="Have an idea for Orbit?"
      body="Suggest a tool, report a problem or just say hello. A real person reads every message."
    >
      {#snippet actions()}
        <Button
          href={`mailto:${config.supportEmail}`}
          variant="ink"
        >
          Contact us
          <Mail />
        </Button>
        <Button href={`${config.github}/issues`} target="_blank" rel="noopener noreferrer" variant="light">
          Open an issue
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
