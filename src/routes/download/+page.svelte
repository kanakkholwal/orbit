<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import { config } from "$constants/app";
  import { Download } from "@lucide/svelte";

  let { data } = $props();

  const platforms = $derived([
    {
      name: "Windows",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5"><path d="M3 5.557L10.373 4.5v7.05H3V5.557zM11.124 4.388L21 3v8.55h-9.876V4.388zM3 12.45h7.373V19.5L3 18.443V12.45zm8.124 0H21V21l-9.876-1.388V12.45z"/></svg>`,
      downloads: [
        { label: "Download .msi (recommended)", url: data.downloads.windowsMsi },
        { label: "Download .exe", url: data.downloads.windowsExe },
      ],
      requirements: "Windows 10 (64 bit)",
    },
    {
      name: "Linux",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm-1 3v2H9v2h2v4H9v2h6v-2h-2v-6h2V7h-4z"/></svg>`,
      downloads: [
        { label: "Download .AppImage", url: data.downloads.linuxAppImage },
        { label: "Download .deb", url: data.downloads.linuxDeb },
        { label: "Download .rpm", url: data.downloads.linuxRpm },
      ],
      requirements: "glibc >= 2.28 (e.g. Ubuntu 20, Debian 10, Fedora 36)",
    },
  ]);
</script>

<svelte:head>
  <title>Download {config.appName}</title>
</svelte:head>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="flex-1 pt-24 pb-20 md:pt-32">
    <div class="container mx-auto max-w-6xl px-6 lg:px-8">

      <!-- Header -->
      <div class="mb-12 flex items-start justify-between">
        <div>
          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
            Download {config.appName}
          </h1>
          <p class="mt-3 text-muted-foreground text-base">
            Version {data.version} · Native performance · Zero server uploads
          </p>
        </div>
        <a
          href={config.github + "/releases"}
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          View previous releases
        </a>
      </div>

      <!-- Platform grid -->
      <div class="border rounded-2xl overflow-hidden divide-y divide-border">

        <!-- Column headers -->
        <div class="grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_1fr] divide-x divide-border bg-muted/30">
          <div class="p-5 text-sm font-medium text-muted-foreground">Select download</div>
          {#each platforms as platform}
            <div class="p-5 flex items-center gap-2.5 font-semibold text-foreground">
              {@html platform.icon}
              {platform.name}
            </div>
          {/each}
        </div>

        <!-- Download links row -->
        <div class="grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_1fr] divide-x divide-border">
          <div class="p-5 text-sm text-muted-foreground"></div>
          {#each platforms as platform}
            <div class="p-5 flex flex-col gap-2.5">
              {#each platform.downloads as dl}
                <a
                  href={dl.url || "#"}
                  class="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors group w-fit"
                  class:opacity-40={!dl.url || dl.url === "#"}
                  aria-disabled={!dl.url || dl.url === "#"}
                >
                  <Download size={14} strokeWidth={2} class="text-muted-foreground group-hover:text-primary transition-colors" />
                  {dl.label}
                </a>
              {/each}
            </div>
          {/each}
        </div>

        <!-- Requirements row -->
        <div class="grid grid-cols-[200px_1fr] md:grid-cols-[200px_1fr_1fr] divide-x divide-border bg-muted/20">
          <div class="p-5 text-sm font-semibold text-foreground">Minimum Requirements</div>
          {#each platforms as platform}
            <div class="p-5 text-sm text-muted-foreground leading-relaxed">
              {platform.requirements}
            </div>
          {/each}
        </div>

      </div>

      <!-- Mobile coming soon note -->
      <p class="mt-6 text-sm text-muted-foreground/70 text-center">
        Mobile (Android &amp; iOS) — coming soon. Built with Tauri.
      </p>

    </div>
  </main>

  <Footer />
</div>
