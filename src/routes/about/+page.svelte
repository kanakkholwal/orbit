<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconArrowUpRight as ArrowUpRight, IconBrandGithub as Github } from "@tabler/icons-svelte";
  import { cubicOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  const principles = [
    {
      title: "Local first",
      body: "Documents stay on your machine. Every transformation runs in your browser or in the desktop app — no uploads, no relay servers, no telemetry on file contents.",
    },
    {
      title: "Quietly fast",
      body: "We treat performance as a design constraint. The toolkit uses WebAssembly engines and streaming pipelines so even large PDFs feel responsive on modest hardware.",
    },
    {
      title: "Open and auditable",
      body: "The full source is on GitHub under GPL-3.0. The privacy claims are verifiable, the tools are forkable, and the roadmap is public.",
    },
    {
      title: "Restraint over surface",
      body: "We'd rather ship fewer tools that work exceptionally than a long menu of mediocre ones. Each tool earns its place by solving a real, measured pain.",
    },
  ];

  const stack = [
    { label: "Frontend", value: "SvelteKit + Svelte 5 runes" },
    { label: "Styling", value: "Tailwind CSS v4 (CSS-first)" },
    { label: "Desktop", value: "Tauri 2 (Rust)" },
    { label: "PDF engine", value: "PDF.js, pdf-lib, qpdf-wasm" },
    { label: "OCR", value: "Tesseract.js" },
    { label: "License", value: "GPL-3.0-only" },
  ];
</script>

<Seo
  title={`About ${config.appName}`}
  description={`The story, principles, and people behind ${config.appName} — a privacy-first PDF toolkit that runs entirely on your device.`}
  keywords={[
    "about orbit pdf",
    "privacy first pdf tool",
    "open source pdf editor",
  ]}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="mx-auto w-full max-w-4xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
    <header
      class="flex flex-col gap-5 border-b border-border pb-12"
      in:fly={{ y: 12, duration: 500, easing: cubicOut }}
    >
      <span
        class="label-eyebrow text-primary"
      >
        About
      </span>
      <h1
        class="max-w-2xl text-heading text-foreground sm:text-heading-lg"
      >
        A PDF toolkit that respects your
        <span class="text-primary">files and your time.</span>
      </h1>
      <p class="max-w-2xl text-body leading-relaxed text-muted-foreground">
        {config.appName} started as a small frustration with the state of PDF tools
        on the web — slow, ad-laden, and quick to ask for an upload. We rebuilt the
        category from first principles around three commitments: keep work local,
        keep the experience quiet, and keep the source open.
      </p>
    </header>

    <section class="mt-16">
      <div class="mb-8 flex items-baseline justify-between border-b border-border pb-4">
        <h2
          class="label-eyebrow text-muted-foreground"
        >
          Principles
        </h2>
        <span class="font-mono text-caption tabular-nums text-muted-foreground">
          01
        </span>
      </div>

      <ul class="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2">
        {#each principles as p, i}
          <li
            class="flex flex-col gap-2"
            in:fly={{
              y: 16,
              duration: 520,
              delay: 100 + i * 60,
              easing: cubicOut,
            }}
          >
            <h3 class="text-xl font-medium tracking-tight text-foreground">
              {p.title}
            </h3>
            <p class="text-body-sm leading-relaxed text-muted-foreground">
              {p.body}
            </p>
          </li>
        {/each}
      </ul>
    </section>

    <section class="mt-20">
      <div class="mb-8 flex items-baseline justify-between border-b border-border pb-4">
        <h2
          class="label-eyebrow text-muted-foreground"
        >
          Stack
        </h2>
        <span class="font-mono text-caption tabular-nums text-muted-foreground">
          02
        </span>
      </div>

      <dl
        class="rounded-md border border-border bg-muted/30 divide-y divide-border"
      >
        {#each stack as row, i (row.label)}
          <div
            class="grid grid-cols-3 gap-4 px-5 py-4 sm:grid-cols-4"
            in:fly={{
              y: 10,
              duration: 420,
              delay: 80 + i * 40,
              easing: cubicOut,
            }}
          >
            <dt
              class="col-span-1 label-eyebrow text-muted-foreground"
            >
              {row.label}
            </dt>
            <dd class="col-span-2 text-body-sm text-foreground sm:col-span-3">
              {row.value}
            </dd>
          </div>
        {/each}
      </dl>
    </section>

    <section
      class="mt-20 flex flex-col gap-5 border-t border-border pt-10 sm:flex-row sm:items-end sm:justify-between"
      in:fly={{ y: 12, duration: 500, delay: 200, easing: cubicOut }}
    >
      <div class="max-w-md">
        <h2
          class="text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
        >
          Get involved
        </h2>
        <p class="mt-2 text-body-sm leading-relaxed text-muted-foreground">
          File issues, suggest tools, or open a pull request. The codebase is
          documented and the maintainers read every thread.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          href={config.github}
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          class="rounded-sm"
        >
          <Github size={16} />
          GitHub
        </Button>
        <Button
          href={`mailto:${config.supportEmail}`}
          class="rounded-sm bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
        >
          Contact
          <ArrowUpRight size={16} />
        </Button>
      </div>
    </section>
  </main>

  <Footer />
</div>
