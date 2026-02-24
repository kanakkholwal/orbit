<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import { Button } from "$components/ui/button";
  import { Download, Info, Monitor, Terminal } from "@lucide/svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>Download App | Desktop</title>
</svelte:head>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main
    class="flex-1 flex flex-col items-center justify-center pt-24 pb-20 md:pt-32 lg:pt-40"
  >
    <div class="container mx-auto max-w-3xl px-4 space-y-5">
      <div class="text-center mb-16 space-y-6">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/40 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"
            ></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"
            ></span>
          </span>
          Release {data.version} Available
        </div>

        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground"
        >
          Get the <span class="text-primary">desktop</span> app.
        </h1>
        <p
          class="text-lg text-muted-foreground max-w-xl mx-auto font-light leading-relaxed"
        >
          Native performance, offline capabilities, and absolute privacy. Built
          seamlessly for your operating system.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <div
          class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-3xl bg-card shadow-sm border transition-all hover:shadow-md"
        >
          <div class="flex items-center gap-5 mb-5 sm:mb-0">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-105"
            >
              <Monitor size={26} strokeWidth={1.5} />
            </div>
            <div>
              <h3 class="text-xl font-medium text-foreground tracking-tight">
                Windows
              </h3>
              <p class="text-sm text-muted-foreground font-light mt-0.5">
                Windows 10 and 11 (64-bit)
              </p>
            </div>
          </div>

          <Button
            variant="dark"
            size="lg"
            class="px-8 rounded-full hover:scale-105"
            href={data.downloads.windows}
          >
            <Download size={16} strokeWidth={2} />
            Download .msi
          </Button>
        </div>

        <div
          class="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 rounded-3xl bg-card shadow-sm border transition-all hover:shadow-md"
        >
          <div class="flex items-center gap-5 mb-5 sm:mb-0">
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-105"
            >
              <Terminal size={26} strokeWidth={1.5} />
            </div>
            <div>
              <h3 class="text-xl font-medium text-foreground tracking-tight">
                Linux
              </h3>
              <p class="text-sm text-muted-foreground font-light mt-0.5">
                Ubuntu, Debian, and Arch
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Button
              href={data.downloads.linuxAppImage}
              variant="dark"
              size="lg"
              class="px-8 rounded-full hover:scale-105"
            >
              .AppImage
            </Button>
            <Button
              href={data.downloads.linuxDeb}
              variant="dark"
              size="lg"
              class="px-8 rounded-full hover:scale-105"
            >
              .deb
            </Button>
          </div>
        </div>
      </div>

      <div class="text-center">
        <p
          class="text-sm text-muted-foreground/80 font-light flex items-center justify-center gap-2"
        >
          <Info size={16} class="opacity-70" />
          Built with Tauri. Zero server uploads.
        </p>
      </div>
    </div>
  </main>

  <Footer />
</div>
