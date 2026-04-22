<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { toolList } from "$tools/list";
  import {
    ArrowRight,
    ArrowUpRight,
    Check,
    Cpu,
    Github,
    Globe,
    Layers,
    Lock,
    Zap,
  } from "@lucide/svelte";

  // Mocking tools data for preview purposes if not loaded
  const displayTools = toolList?.slice(0, 6) || [];

  const features = [
    {
      title: "100% Client-Side",
      desc: "Zero data transfer. The engine runs locally within your browser's sandbox.",
      icon: Lock,
    },
    {
      title: "Unlimited Processing",
      desc: "No daily quotas or file size caps. Batch process as much as your device handles.",
      icon: Zap,
    },
    {
      title: "Offline Capable",
      desc: "Install as a PWA. Works perfectly without an internet connection.",
      icon: Globe,
    },
  ];
</script>

<Seo 
  title="Free, Fast & Offline PDF Tools | Orbit"
  description={config.appDescription}
  keywords={config.appKeywords}
  isBase={true}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="flex-1">
    <section class="relative pt-24 pb-20 md:pt-32 lg:pt-40">
      <div class="container mx-auto max-w-app px-4 text-center">
        <div class="mb-8 inline-flex items-center justify-center">
          <a
            href={config.github}
            target="_blank"
            class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-border/80 bg-card/75 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <Github class="size-3" />
            <span class="relative">Open Source</span>
            <ArrowUpRight
              class="ml-1 size-3 transition-transform group-hover:translate-x-0.5"
            />
          </a>
        </div>

        <h1
          class="mx-auto mb-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:leading-[1.1]"
        >
          Master your PDFs with
          <span
            class="relative whitespace-nowrap text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60"
          >
            absolute privacy.
          </span>
        </h1>

        <p
          class="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
        >
          The professional PDF toolkit that runs entirely in your browser.
          Powerful WASM engine, no server uploads, simply secure.
        </p>

        <div
          class="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            href="/explore"
            class="h-12 px-8! shadow-lg shadow-brand transition-all hover:scale-[1.02] bg-brand"
          >
            Start Processing
            <ArrowRight class="ml-2 size-4" />
          </Button>
          <Button
            href={config.github}
            target="_blank"
            rel="noopener noreferrer"
            variant="dark"
            size="lg"
            class="h-12 px-8!"
          >
            <Github class="mr-2 size-4" />
            Star on GitHub
          </Button>
        </div>

        <div class="mt-32 grid grid-cols-2 gap-y-10 border-t border-border pt-12 md:grid-cols-4 mx-auto max-w-4xl">
        {#each [['1K+', 'Processed'], ['0', 'Server Uploads'], ['100%', 'Client Side'], ['OSS', 'License']] as [val, label]}
          <div class="text-center md:text-left">
            <div class="text-2xl font-semibold tracking-tighter lg:text-3xl">{val}</div>
            <div class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mt-1">{label}</div>
          </div>
        {/each}
      </div>
      </div>
    </section>

    <section id="tools" class="py-24">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="mb-16 flex flex-col items-center text-center">
          <h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Essential Tools
          </h2>
          <p class="max-w-150 text-muted-foreground">
            A complete suite of utilities designed for speed and simplicity. No
            subscriptions, no hidden limits.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each displayTools as tool}
            <a
              href={`/tools/${tool.slug}`}
              class="group relative flex flex-col p-6 h-full rounded-3xl border border-white/5 bg-linear-to-b from-card to-card/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]"
            >
              <div
                class="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <div class="relative z-10">
                <div
                  class={`size-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10 ${tool.color}`}
                >
                  {#if tool.icon}
                    {@const Icon = tool.icon}
                    <Icon
                      size={24}
                      strokeWidth={1.5}
                      class="group-hover:rotate-12 transition-transform duration-300"
                    />
                  {/if}
                </div>

                <h3
                  class="text-xl font-semibold tracking-tight text-foreground mb-2"
                >
                  {tool.title}
                </h3>

                <p
                  class="text-[15px] text-muted-foreground/80 leading-snug line-clamp-2"
                >
                  {tool.description}
                </p>

                <div
                  class="mt-6 flex items-center text-sm font-medium text-primary"
                >
                  <span class="relative">
                    Explore
                    <span
                      class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"
                    ></span>
                  </span>
                  <ArrowRight
                    size={16}
                    class="ml-2 transform transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </a>
          {/each}
        </div>
      </div>
    </section>

    <section class="border-t border-border/50 bg-muted/20 py-24">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="grid gap-16 md:grid-cols-2 md:items-center">
          <div class="space-y-8">
            <div class="space-y-4">
              <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
                Privacy isn't a setting.<br />
                <span class="text-muted-foreground">It's the architecture.</span
                >
              </h2>
              <p class="text-lg text-muted-foreground">
                Traditional PDF tools upload your documents to remote servers.
                We engineered a WebAssembly solution that brings the server to
                you.
              </p>
            </div>

            <div class="space-y-6">
              {#each features as feature}
                <div class="flex gap-4">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h4
                      class="font-medium leading-none tracking-tight text-foreground"
                    >
                      {feature.title}
                    </h4>
                    <p
                      class="mt-2 text-sm text-muted-foreground leading-relaxed"
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="relative mx-auto w-full max-w-md lg:ml-auto">
            <div
              class="absolute -right-4 top-0 -z-10 size-72 rounded-full bg-primary/10 blur-[80px]"
            ></div>

            <div
              class="relative overflow-hidden rounded-3xl border border-border bg-background/40 p-8 shadow-2xl backdrop-blur-xl"
            >
              <div
                class="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent"
              ></div>

              <div class="relative grid gap-4">
                <div
                  class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]"
                >
                  <div
                    class="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500"
                  >
                    <Lock size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      Local Encryption
                    </div>
                    <div class="text-xs text-muted-foreground">
                      AES-256 standard
                    </div>
                  </div>
                  <div class="ml-auto flex items-center gap-2">
                    <div
                      class="size-2 animate-pulse rounded-full bg-green-500"
                    ></div>
                  </div>
                </div>

                <div
                  class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]"
                >
                  <div
                    class="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500"
                  >
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      WASM Engine
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Native speed
                    </div>
                  </div>
                </div>

                <div
                  class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]"
                >
                  <div
                    class="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500"
                  >
                    <Layers size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">
                      Modular Core
                    </div>
                    <div class="text-xs text-muted-foreground">
                      Lazy loaded assets
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
