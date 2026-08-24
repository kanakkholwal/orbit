<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config, faqs } from "$constants/app";
  import { cn } from "$lib/utils";
  import { toolList } from "$tools/list";
  import {
    IconArrowUpRight as ArrowUpRight,
    IconBrandGithub as Github,
    IconInfinity as InfinityIcon,
    IconShield as Shield,
    IconWifiOff as WifiOff,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  const sections = [
    { id: "getting-started", label: "Getting started" },
    { id: "installation", label: "Installation" },
    { id: "tools", label: "Tools" },
    { id: "privacy", label: "Privacy" },
    { id: "faq", label: "FAQ" },
  ];

  const guarantees = [
    {
      icon: Shield,
      title: "100% private",
      body: "Files never leave your device. Every operation runs locally in your browser or app shell.",
    },
    {
      icon: Zap,
      title: "Native speed",
      body: "WebAssembly engines deliver desktop-grade performance, even on hundred-page documents.",
    },
    {
      icon: WifiOff,
      title: "Offline ready",
      body: "Works in airplane mode once loaded. The desktop app needs no network at all.",
    },
    {
      icon: InfinityIcon,
      title: "No limits",
      body: "Process files of any size. Constraints are your machine's, not ours.",
    },
  ];

  const installSteps = [
    {
      label: "01",
      title: "Open the web app",
      body: "Visit the home page. Tools load instantly and remain available offline as a PWA.",
    },
    {
      label: "02",
      title: "Download the desktop build",
      body: "Pick the installer for your OS from GitHub Releases — Windows (.msi/.exe), macOS (.dmg), or Linux (.AppImage/.deb).",
    },
    {
      label: "03",
      title: "Launch and pin",
      body: "Open the app, pin it to your dock or taskbar, and you have a permanent local PDF workshop.",
    },
  ];

  const privacyPoints = [
    {
      title: "Local processing",
      body: "Every transformation runs on your CPU. There is no server roundtrip, by design.",
    },
    {
      title: "No analytics on contents",
      body: "We never inspect, log, or fingerprint document contents. Anonymous usage signals are opt-in.",
    },
    {
      title: "Audit-ready",
      body: "The full source is on GitHub. Reviewers can verify every claim against the code.",
    },
  ];
</script>

<Seo
  title="Documentation"
  description="Get started with Orbit PDF — installation, tools, privacy, and answers to common questions."
  keywords={[
    "orbit pdf docs",
    "pdf toolkit guide",
    "offline pdf editor docs",
  ]}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <div
    class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pb-24 pt-32 md:flex-row md:gap-16 md:px-8 md:pt-40"
  >
    <aside class="md:w-56 md:shrink-0">
      <div class="sticky top-32 flex flex-col gap-6">
        <div
          class="flex items-baseline justify-between border-b border-border pb-3"
        >
          <span
            class="label-eyebrow text-muted-foreground"
          >
            On this page
          </span>
        </div>
        <nav class="flex flex-col">
          {#each sections as s, i}
            <a
              href={`#${s.id}`}
              class={cn(
                "group flex items-baseline justify-between border-b border-border py-2.5 text-body text-muted-foreground transition-colors duration-300 hover:text-foreground"
              )}
            >
              <span class="relative">
                {s.label}
                <span
                  aria-hidden="true"
                  class="absolute -bottom-0.5 left-0 h-px w-0 bg-foreground transition-[width] duration-300 ease-out group-hover:w-full"
                ></span>
              </span>
              <span
                class="font-mono text-caption tabular-nums text-muted-foreground"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </a>
          {/each}
        </nav>
      </div>
    </aside>

    <main class="flex-1">
      <header
        class="flex flex-col gap-5 border-b border-border pb-12"
        in:fly={{ y: 12, duration: 500, easing: cubicOut }}
      >
        <span
          class="label-eyebrow text-primary"
        >
          Documentation
        </span>
        <h1
          class="text-heading text-foreground sm:text-heading-lg"
        >
          Build with confidence,
          <span class="text-primary">work in private.</span>
        </h1>
        <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
          Everything you need to install, integrate, and trust {config.appName}
          — written for engineers, designed for everyone.
        </p>
      </header>

      <section
        id="getting-started"
        class="mt-20 scroll-mt-32"
      >
        <div
          class="mb-8 flex items-baseline justify-between border-b border-border pb-4"
        >
          <h2
            class="label-eyebrow text-muted-foreground"
          >
            Getting started
          </h2>
          <span
            class="font-mono text-caption tabular-nums text-muted-foreground"
          >
            01
          </span>
        </div>

        <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
          {config.appName} is a privacy-first PDF toolkit. There is nothing to sign
          up for and nothing to install for the web tools — open a tool, drop a
          file, get a result.
        </p>

        <ul class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border/60 sm:grid-cols-2">
          {#each guarantees as g, i}
            <li
              class="flex flex-col gap-2 bg-card p-6"
              in:fly={{
                y: 12,
                duration: 480,
                delay: 100 + i * 60,
                easing: cubicOut,
              }}
            >
              <span class="inline-flex size-7 items-center justify-center rounded-sm bg-primary/10 text-primary">
                <g.icon class="size-3.5" />
              </span>
              <h3 class="text-body font-medium text-foreground">{g.title}</h3>
              <p class="text-body leading-relaxed text-muted-foreground">
                {g.body}
              </p>
            </li>
          {/each}
        </ul>
      </section>

      <section id="installation" class="mt-24 scroll-mt-32">
        <div
          class="mb-8 flex items-baseline justify-between border-b border-border pb-4"
        >
          <h2
            class="label-eyebrow text-muted-foreground"
          >
            Installation
          </h2>
          <span
            class="font-mono text-caption tabular-nums text-muted-foreground"
          >
            02
          </span>
        </div>

        <ol class="flex flex-col gap-8">
          {#each installSteps as step, i (step.label)}
            <li
              class="flex flex-col gap-2 border-l border-border pl-6"
              in:fly={{
                y: 12,
                duration: 480,
                delay: 80 + i * 70,
                easing: cubicOut,
              }}
            >
              <span
                class="label-eyebrow text-primary"
              >
                Step {step.label}
              </span>
              <h3 class="text-xl font-medium tracking-tight text-foreground">
                {step.title}
              </h3>
              <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          {/each}
        </ol>

        <div
          class="mt-8 rounded-md border border-warning/30 bg-warning/5 p-5 text-body leading-relaxed text-warning-foreground"
          in:fly={{ y: 8, duration: 420, delay: 320, easing: cubicOut }}
        >
          <p class="label-eyebrow text-warning">
            Note
          </p>
          <p class="mt-2 text-foreground">
            Desktop installers are signed with self-issued certificates. SmartScreen
            and Gatekeeper warnings on first launch are expected for independent
            open-source projects — the source is fully auditable.
          </p>
        </div>
      </section>

      <section id="tools" class="mt-24 scroll-mt-32">
        <div
          class="mb-8 flex items-baseline justify-between border-b border-border pb-4"
        >
          <h2
            class="label-eyebrow text-muted-foreground"
          >
            Tools
          </h2>
          <span
            class="font-mono text-caption tabular-nums text-muted-foreground"
          >
            03
          </span>
        </div>

        <ul class="flex flex-col">
          {#each toolList.slice(0, 8) as tool, i (tool.slug)}
            <li
              in:fly={{
                y: 8,
                duration: 380,
                delay: 60 + i * 35,
                easing: cubicOut,
              }}
            >
              <a
                href={`/tools/${tool.slug}`}
                class="group flex items-start justify-between gap-6 border-b border-border py-5 transition-colors duration-300 hover:bg-muted/30"
              >
                <div class="flex items-start gap-4">
                  <tool.icon
                    class="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                  />
                  <div class="flex flex-col gap-1">
                    <span class="text-body font-medium text-foreground">
                      {tool.title}
                    </span>
                    <span class="text-body text-muted-foreground">
                      {tool.description.split(". ")[0]}
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  class="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </a>
            </li>
          {/each}
        </ul>
      </section>

      <section id="privacy" class="mt-24 scroll-mt-32">
        <div
          class="mb-8 flex items-baseline justify-between border-b border-border pb-4"
        >
          <h2
            class="label-eyebrow text-muted-foreground"
          >
            Privacy
          </h2>
          <span
            class="font-mono text-caption tabular-nums text-muted-foreground"
          >
            04
          </span>
        </div>

        <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
          The privacy model is structural, not promised. The architecture
          itself prevents the kinds of data flows that make uploads risky.
        </p>

        <ul class="mt-10 flex flex-col gap-6">
          {#each privacyPoints as p, i}
            <li
              class="grid grid-cols-1 gap-2 border-b border-border pb-6 sm:grid-cols-4"
              in:fly={{
                y: 10,
                duration: 460,
                delay: 80 + i * 60,
                easing: cubicOut,
              }}
            >
              <h3
                class="col-span-1 text-body font-medium tracking-tight text-foreground"
              >
                {p.title}
              </h3>
              <p
                class="col-span-1 max-w-xl text-body leading-relaxed text-muted-foreground sm:col-span-3"
              >
                {p.body}
              </p>
            </li>
          {/each}
        </ul>
      </section>

      <section id="faq" class="mt-24 scroll-mt-32">
        <div
          class="mb-8 flex items-baseline justify-between border-b border-border pb-4"
        >
          <h2
            class="label-eyebrow text-muted-foreground"
          >
            FAQ
          </h2>
          <span
            class="font-mono text-caption tabular-nums text-muted-foreground"
          >
            05
          </span>
        </div>

        <ul class="flex flex-col">
          {#each faqs as faq, i (faq.question)}
            <li
              class="flex flex-col gap-2 border-b border-border py-6"
              in:fly={{
                y: 8,
                duration: 420,
                delay: 60 + i * 50,
                easing: cubicOut,
              }}
            >
              <h3 class="text-body font-medium text-foreground">
                {faq.question}
              </h3>
              <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
                {faq.answer}
              </p>
            </li>
          {/each}
        </ul>

        <div
          class="mt-12 flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between"
          in:fly={{ y: 12, duration: 500, delay: 280, easing: cubicOut }}
        >
          <div>
            <p
              class="label-eyebrow text-muted-foreground"
            >
              Still stuck?
            </p>
            <p class="mt-1 text-body text-foreground">
              Open an issue or peek at how it's built.
            </p>
          </div>
          <Button
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            class="rounded-sm"
          >
            <Github size={16} />
            View on GitHub
          </Button>
        </div>
      </section>
    </main>
  </div>

  <Footer />
</div>
