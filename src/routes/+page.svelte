<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import { toolList } from "$tools/list";
  import {
    ArrowRight,
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

<div class="relative flex min-h-screen w-full flex-col bg-background text-foreground antialiased selection:bg-primary/20">
  <Navbar />

  <div class="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-background">
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>
    
    <div class="absolute left-0 top-0 -z-10 size-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px] opacity-50 dark:opacity-20"></div>
    <div class="absolute right-0 top-0 -z-10 size-125 translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[100px] opacity-50 dark:opacity-20"></div>
    <div class="absolute bottom-0 left-1/2 -z-10 size-200 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px] opacity-50 dark:opacity-20"></div>
  </div>

  <main class="flex-1">
    <section class="relative pt-24 pb-20 md:pt-32 lg:pt-40">
      <div class="container mx-auto max-w-5xl px-4 text-center">
        
        <div class="mb-8 inline-flex items-center justify-center">
          <a href="https://github.com/kanakkholwal/nexopdf" target="_blank" class="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-border/50 bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-md transition-colors hover:bg-muted/50 hover:text-foreground">
            <span class="flex h-2 w-2 rounded-full bg-primary shadow-lg"></span>
            <span class="relative">v2.0 is now Open Source</span>
            <ArrowRight class="ml-1 size-3 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        <h1 class="mx-auto mb-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:leading-[1.1]">
          Master your PDFs with
          <span class="relative whitespace-nowrap text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            absolute privacy.
          </span>
        </h1>

        <p class="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
          The professional PDF toolkit that runs entirely in your browser. 
          Powerful WASM engine, no server uploads, simply secure.
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/explore"
            class="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 ring-offset-background transition-all hover:scale-[1.02] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start Processing
            <ArrowRight class="ml-2 size-4" />
          </a>
          <a
            href="https://github.com/kanakkholwal/nexopdf"
            target="_blank"
            class="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-background/60 backdrop-blur-sm px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Github class="mr-2 size-4" />
            Star on GitHub
          </a>
        </div>

        <div class="mt-20 grid grid-cols-2 gap-8 border-y border-border/50 bg-background/30 py-8 backdrop-blur-sm md:grid-cols-4 lg:rounded-2xl lg:border lg:bg-card/30 lg:shadow-sm">
          <div class="space-y-1">
            <h3 class="text-3xl font-bold tracking-tight text-foreground">1M+</h3>
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Files Processed</p>
          </div>
          <div class="space-y-1">
            <h3 class="text-3xl font-bold tracking-tight text-foreground">0</h3>
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Server Uploads</p>
          </div>
          <div class="space-y-1">
            <h3 class="text-3xl font-bold tracking-tight text-foreground">100%</h3>
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Client Side</p>
          </div>
          <div class="space-y-1">
            <h3 class="text-3xl font-bold tracking-tight text-foreground">5.0</h3>
            <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Open Source</p>
          </div>
        </div>
      </div>
    </section>

    <section id="tools" class="py-24">
      <div class="container mx-auto max-w-6xl px-4">
        <div class="mb-16 flex flex-col items-center text-center">
          <h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Essential Tools</h2>
          <p class="max-w-150 text-muted-foreground">
            A complete suite of utilities designed for speed and simplicity. 
            No subscriptions, no hidden limits.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {#each displayTools as tool}
            <a
              href={`/tools/${tool.slug}`}
              class="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:bg-card hover:shadow-md"
            >
              <div class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

              <div class="relative z-10 flex flex-col gap-4">
                <div class={`flex size-12 items-center justify-center rounded-xl border border-border/50 bg-background shadow-inner ${tool.color || 'text-primary'}`}>
                  {#if tool.icon}
                    <svelte:component this={tool.icon} size={24} strokeWidth={1.5} />
                  {/if}
                </div>
                
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold tracking-tight text-foreground">{tool.title}</h3>
                  <p class="text-sm leading-relaxed text-muted-foreground">
                    {tool.description}
                  </p>
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
                <span class="text-muted-foreground">It's the architecture.</span>
              </h2>
              <p class="text-lg text-muted-foreground">
                Traditional PDF tools upload your documents to remote servers. 
                We engineered a WebAssembly solution that brings the server to you.
              </p>
            </div>

            <div class="space-y-6">
              {#each features as feature}
                <div class="flex gap-4">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check size={18} strokeWidth={3} />
                  </div>
                  <div>
                    <h4 class="font-medium leading-none tracking-tight text-foreground">{feature.title}</h4>
                    <p class="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              {/each}
            </div>
          </div>

          <div class="relative mx-auto w-full max-w-md lg:ml-auto">
            <div class="absolute -right-4 top-0 -z-10 size-72 rounded-full bg-primary/10 blur-[80px]"></div>

            <div class="relative overflow-hidden rounded-3xl border border-border bg-background/40 p-8 shadow-2xl backdrop-blur-xl">
              <div class="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent"></div>
              
              <div class="relative grid gap-4">
                <div class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <Lock size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">Local Encryption</div>
                    <div class="text-xs text-muted-foreground">AES-256 standard</div>
                  </div>
                  <div class="ml-auto flex items-center gap-2">
                    <div class="size-2 animate-pulse rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Cpu size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">WASM Engine</div>
                    <div class="text-xs text-muted-foreground">Native speed</div>
                  </div>
                </div>

                 <div class="flex items-center gap-4 rounded-xl border border-border/50 bg-card/40 p-4 shadow-sm backdrop-blur-md transition-transform hover:scale-[1.02]">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <Layers size={20} />
                  </div>
                  <div>
                    <div class="text-sm font-medium text-foreground">Modular Core</div>
                    <div class="text-xs text-muted-foreground">Lazy loaded assets</div>
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