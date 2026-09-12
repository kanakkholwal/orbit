<script lang="ts">
  import { BrandPanel, FaqList, PageHero, RailFrame, RailRow } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config, faqs } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    IconArrowUpRight as ArrowUpRight,
    IconBolt as Zap,
    IconBrandGithub as Github,
    IconInfinity as InfinityIcon,
    IconShield as Shield,
    IconWifiOff as WifiOff,
  } from "@tabler/icons-svelte";

  const sections = [
    { id: "getting-started", label: "Getting started" },
    { id: "installation", label: "Installation" },
    { id: "tools", label: "Tools" },
    { id: "how-it-works", label: "How it works" },
    { id: "faq", label: "FAQ" },
  ];

  const guarantees = [
    { icon: Shield, title: "Private", body: "Files never leave your device. Every tool runs in your browser or the desktop app." },
    { icon: Zap, title: "Fast", body: "No upload and no queue, so work starts the moment you drop a file." },
    { icon: WifiOff, title: "Offline", body: "Once installed, every tool keeps working without an internet connection." },
    { icon: InfinityIcon, title: "No limits", body: "No page caps and no file-size quotas beyond your own computer's memory." },
  ];

  const installSteps = [
    { title: "Use it in the browser", body: "Open any tool from the home page. Nothing to install and nothing to sign up for." },
    {
      title: "Or download the desktop app",
      body: "Get the installer for Windows (.exe or .msi), macOS (.dmg) or Linux (.AppImage or .deb) from the download page.",
    },
    { title: "Pin it", body: "Pin Orbit to your dock or taskbar and it opens like any other app." },
  ];

  const engines = [
    { name: "qpdf", role: "Repairs, restructures and encrypts files", runtime: "WebAssembly" },
    { name: "Tesseract", role: "Reads text from scanned pages", runtime: "WebAssembly" },
    { name: "PDF.js", role: "Renders pages on screen", runtime: "JavaScript" },
    { name: "pdf-lib", role: "Writes and edits PDF files", runtime: "JavaScript" },
    { name: "Tauri", role: "Wraps the desktop app with a Rust core", runtime: "Native" },
  ];

  const faqItems = faqs.map((f) => ({ q: f.question, a: f.answer }));
</script>

<Seo
  title="Documentation"
  description="Get started with Orbit PDF: installation, tools, how it works and answers to common questions."
  keywords={["orbit pdf docs", "pdf toolkit guide", "offline pdf editor docs"]}
/>

<RailFrame>
  <RailRow divider={false} label="Documentation">
    <PageHero
      badge="Documentation"
      title="Everything you need"
      accent="to get started"
      lede={`How to install ${config.appName}, what each tool does, and exactly how your files stay private.`}
    />
  </RailRow>

  <RailRow label="Guide">
    <div class="flex flex-col gap-10 px-1 py-6 sm:px-4 sm:py-8 lg:flex-row lg:gap-20 lg:px-16 lg:py-10">
      <aside class="shrink-0 lg:w-56">
        <nav class="panel-card flex flex-col p-2 lg:sticky lg:top-28" aria-label="On this page">
          {#each sections as s, i (s.id)}
            <a
              href={`#${s.id}`}
              class="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-body text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              {s.label}
              <span class="text-caption tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
            </a>
          {/each}
        </nav>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col gap-16">
        <section id="getting-started" class="scroll-mt-28">
          <h2 class="text-heading-sm font-medium text-foreground sm:text-heading">Getting started</h2>
          <p class="mt-3 max-w-2xl text-body leading-relaxed text-muted-foreground">
            {config.appName} is a private PDF toolkit. Open a tool, drop a file, save the result.
          </p>
          <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {#each guarantees as g (g.title)}
              <li class="panel-card flex flex-col gap-3 p-6">
                <span class="grid size-10 place-items-center rounded-lg border border-border">
                  <g.icon class="size-5 text-primary" />
                </span>
                <h3 class="text-body-lg font-medium text-foreground">{g.title}</h3>
                <p class="text-body leading-relaxed text-muted-foreground">{g.body}</p>
              </li>
            {/each}
          </ul>
        </section>

        <section id="installation" class="scroll-mt-28">
          <h2 class="text-heading-sm font-medium text-foreground sm:text-heading">Installation</h2>
          <ol class="mt-6 flex flex-col gap-3">
            {#each installSteps as step, i (step.title)}
              <li class="panel-card flex gap-4 px-6 py-5">
                <span class="text-body font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 class="text-body-lg font-medium text-foreground">{step.title}</h3>
                  <p class="mt-1 text-body leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            {/each}
          </ol>
          <p class="mt-4 rounded-xl border border-warning/30 bg-warning/5 px-5 py-4 text-body leading-relaxed text-foreground">
            The desktop installers are self-signed, so Windows SmartScreen or macOS Gatekeeper may warn on first
            launch. That is expected for independent open-source apps.
          </p>
        </section>

        <section id="tools" class="scroll-mt-28">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <h2 class="text-heading-sm font-medium text-foreground sm:text-heading">Tools</h2>
            <Button href="/explore" variant="outline" size="sm">
              All {toolList.length} tools
              <ArrowUpRight />
            </Button>
          </div>
          <ul class="panel-card mt-6 divide-y divide-border">
            {#each toolList.slice(0, 8) as tool (tool.slug)}
              <li>
                <a
                  href={`/tools/${tool.slug}`}
                  class="group flex items-start gap-4 px-6 py-4 transition-colors duration-200 hover:bg-muted"
                >
                  <tool.icon class="mt-0.5 size-5 shrink-0 text-primary" />
                  <span class="min-w-0 flex-1">
                    <span class="block text-body font-medium text-foreground">{tool.title}</span>
                    <span class="mt-0.5 block line-clamp-1 text-body text-muted-foreground">
                      {tool.description.split(". ")[0]}
                    </span>
                  </span>
                  <ArrowUpRight class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                </a>
              </li>
            {/each}
          </ul>
        </section>

        <section id="how-it-works" class="scroll-mt-28">
          <h2 class="text-heading-sm font-medium text-foreground sm:text-heading">How it works</h2>
          <p class="mt-3 max-w-2xl text-body leading-relaxed text-muted-foreground">
            The page loads the tool once. Your document is read into the tab's memory, processed by the engines
            below, and written back to your disk. There is no upload endpoint to send it to.
          </p>
          <ul class="panel-card mt-6 divide-y divide-border">
            {#each engines as engine (engine.name)}
              <li class="flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <span>
                  <span class="block text-body font-medium text-foreground">{engine.name}</span>
                  <span class="block text-body text-muted-foreground">{engine.role}</span>
                </span>
                <span class="w-fit rounded-full bg-muted px-2.5 py-0.5 text-caption font-medium text-foreground">
                  {engine.runtime}
                </span>
              </li>
            {/each}
          </ul>
        </section>

        <section id="faq" class="scroll-mt-28">
          <h2 class="mb-6 text-heading-sm font-medium text-foreground sm:text-heading">FAQ</h2>
          <FaqList items={faqItems} variant="cards" />
        </section>
      </div>
    </div>
  </RailRow>

  <RailRow label="Still stuck">
    <BrandPanel title="Still stuck?" body="Open an issue on GitHub or browse the source to see exactly how it's built.">
      {#snippet actions()}
        <Button href={`${config.github}/issues`} target="_blank" rel="noopener noreferrer" variant="light">
          Open an issue
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
