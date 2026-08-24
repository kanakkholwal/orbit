<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import InstallPwaButton from "$components/common/install-pwa-button.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { pwa } from "$lib/pwa.svelte";
  import { cn } from "$lib/utils";
  import {
    IconApple as Apple,
    IconArrowBarToDown as ArrowDownToLine,
    IconArrowUpRight as ArrowUpRight,
    IconBrandGithub as Github,
    IconDeviceDesktop as Monitor,
    IconDeviceMobile as Smartphone,
    IconTerminal as Terminal,
  } from "@tabler/icons-svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";

  type OS = "macOS" | "Windows" | "Linux" | "Unknown";

  let { data } = $props();
  let detectedOS = $state<OS>("Unknown");

  $effect(() => {
    const ua = window.navigator.userAgent;
    // Mobile platforms get the PWA — desktop OS detection only applies on desktop.
    if (pwa.platform === "ios" || pwa.platform === "android") return;
    if (ua.includes("Mac")) detectedOS = "macOS";
    else if (ua.includes("Win")) detectedOS = "Windows";
    else if (ua.includes("Linux")) detectedOS = "Linux";
  });

  let isMobile = $derived(pwa.platform === "ios" || pwa.platform === "android");

  const downloadKeywords = [
    ...config.appKeywords,
    "download orbit",
    "orbit pdf download",
    "offline pdf tools desktop",
  ];

  type DownloadOption = { label: string; url: string | null; tag?: string };
  type Platform = {
    id: OS;
    name: string;
    icon: typeof Apple;
    requirement: string;
    primary: DownloadOption;
    secondary: DownloadOption[];
  };

  const platforms = $derived<Platform[]>([
    {
      id: "macOS",
      name: "macOS",
      icon: Apple,
      requirement: "macOS 10.13 or later",
      primary: {
        label: "Apple Silicon",
        url: data.downloads.macosAppleSilicon,
        tag: ".dmg · arm64",
      },
      secondary: [
        { label: "Intel", url: data.downloads.macosIntel, tag: ".dmg · x64" },
      ],
    },
    {
      id: "Windows",
      name: "Windows",
      icon: Monitor,
      requirement: "Windows 10 or later · 64-bit",
      primary: {
        label: "Installer",
        url: data.downloads.windowsExe,
        tag: ".exe",
      },
      secondary: [
        { label: "MSI package", url: data.downloads.windowsMsi, tag: ".msi" },
      ],
    },
    {
      id: "Linux",
      name: "Linux",
      icon: Terminal,
      requirement: "glibc ≥ 2.28 (Ubuntu 20+, Debian 10+, Fedora 36+)",
      primary: {
        label: "AppImage",
        url: data.downloads.linuxAppImage,
        tag: ".AppImage",
      },
      secondary: [
        { label: "Debian", url: data.downloads.linuxDeb, tag: ".deb" },
        { label: "Red Hat", url: data.downloads.linuxRpm, tag: ".rpm" },
      ],
    },
  ]);

  let primaryDownload = $derived(() => {
    switch (detectedOS) {
      case "macOS":
        return {
          link: data.downloads.macosAppleSilicon,
          label: "Download for macOS",
          tag: "Apple Silicon · .dmg",
        };
      case "Windows":
        return {
          link: data.downloads.windowsExe ?? data.downloads.windowsMsi,
          label: "Download for Windows",
          tag: "64-bit · .exe",
        };
      case "Linux":
        return {
          link: data.downloads.linuxAppImage ?? data.downloads.linuxDeb,
          label: "Download for Linux",
          tag: ".AppImage",
        };
      default:
        return {
          link: null,
          label: "Choose your platform",
          tag: "Auto-detect unavailable",
        };
    }
  });
</script>

<Seo
  title={`Download ${config.appName}`}
  description={`Download ${config.appName} for Windows, macOS, and Linux. Free, fast, offline-first PDF toolkit. No uploads, fully client-side.`}
  keywords={downloadKeywords}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="flex-1">
    <section class="px-5 pb-16 pt-32 md:px-8 md:pt-44 lg:pt-52">
      <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div
          class="flex flex-wrap items-center justify-center gap-3"
          in:fade={{ duration: 400, delay: 60 }}
        >
          <span
            class="relative flex size-1.5 items-center justify-center"
            aria-hidden="true"
          >
            <span
              class="absolute inline-flex size-full animate-ping rounded-full bg-primary/40"
            ></span>
            <span
              class="relative inline-flex size-1.5 rounded-full bg-primary"
            ></span>
          </span>
          <span
            class="label-eyebrow text-primary"
          >
            Download
          </span>
          <span class="text-muted-foreground">·</span>
          <span
            class="label-eyebrow text-muted-foreground"
          >
            Latest release {data.version}
          </span>
        </div>

        <h1
          class="text-balance text-heading-lg text-foreground md:text-display"
          in:fly={{ y: 16, duration: 600, delay: 120, easing: cubicOut }}
        >
          Get {config.appName}
          <span class="text-primary">
            {#if isMobile}for {pwa.platform === "ios" ? "iOS" : "Android"}.{:else if detectedOS !== "Unknown"}for {detectedOS}.{:else}for desktop.{/if}
          </span>
        </h1>

        <p
          class="max-w-xl text-body-lg leading-relaxed text-muted-foreground"
          in:fly={{ y: 12, duration: 520, delay: 220, easing: cubicOut }}
        >
          {#if isMobile}
            No App Store, no Play Store. Install Orbit PDF as a Progressive Web App —
            it lives on your home screen, works offline, and never uploads your files.
          {:else}
            Free, signed installers for every major platform. No account, no
            tracking, and your documents never leave the device.
          {/if}
        </p>

        <div
          class="flex w-full flex-col items-center gap-5 border-t border-border pt-10"
          in:fly={{ y: 12, duration: 520, delay: 320, easing: cubicOut }}
        >
          <div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span
              class="label-eyebrow text-muted-foreground"
            >
              {#if isMobile}We detected{:else if detectedOS !== "Unknown"}We detected{:else}Auto-detect{/if}
            </span>
            <span class="font-mono text-body-sm tabular-nums text-foreground">
              {#if isMobile}{pwa.platform === "ios" ? "iOS" : "Android"}{:else if detectedOS !== "Unknown"}{detectedOS}{:else}Unavailable{/if}
            </span>
            <span class="label-eyebrow text-muted-foreground">
              {isMobile ? "PWA · install in-place" : primaryDownload().tag}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2">
            {#if isMobile}
              <InstallPwaButton size="lg" class="rounded-sm px-6" />
              <Button href="/install-pwa" variant="outline" size="lg" class="rounded-sm px-5">
                <Smartphone size={16} />
                Install instructions
              </Button>
            {:else if primaryDownload().link}
              <Button
                href={primaryDownload().link!}
                size="lg"
                class="rounded-sm px-6"
              >
                <ArrowDownToLine size={16} />
                {primaryDownload().label}
              </Button>
              <InstallPwaButton variant="outline" size="lg" class="rounded-sm px-5" hideWhenInstalled />
              <Button href="#all-platforms" variant="outline" size="lg" class="rounded-sm px-5">
                All platforms
              </Button>
            {:else}
              <Button
                href="#all-platforms"
                size="lg"
                class="rounded-sm px-6"
              >
                Choose platform
                <ArrowUpRight size={16} />
              </Button>
              <InstallPwaButton variant="outline" size="lg" class="rounded-sm px-5" hideWhenInstalled />
              <Button href="#all-platforms" variant="outline" size="lg" class="rounded-sm px-5">
                All platforms
              </Button>
            {/if}

            <Button
              href={`${config.github}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="lg"
              class="rounded-sm px-5 text-muted-foreground hover:text-foreground"
            >
              <Github size={16} />
              Releases
            </Button>
          </div>
        </div>
      </div>
    </section>

    <section id="all-platforms" class="scroll-mt-32 px-5 py-24 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div
          class="mb-10 flex items-baseline justify-between border-b border-border pb-4"
        >
          <div class="flex flex-col gap-2">
            <span
              class="label-eyebrow text-primary"
            >
              {isMobile ? "Web app" : "Platforms"}
            </span>
            <h2
              class="text-heading text-foreground sm:text-heading-lg"
            >
              {isMobile ? "Install on this device." : "Pick the right build for your machine."}
            </h2>
          </div>
        </div>

        <!-- PWA card — visible on every device. -->
        <div class="mb-6 flex flex-col gap-4 rounded-md border border-primary/30 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-start gap-4">
            <span class="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-primary/15 text-primary">
              <Smartphone class="size-4" />
            </span>
            <div class="flex flex-col gap-1">
              <h3 class="text-body font-medium tracking-tight text-foreground">
                Orbit PDF Web App
              </h3>
              <p class="text-body-sm text-muted-foreground">
                Install in any modern browser. Offline-first, works on mobile, tablet, and desktop.
              </p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <InstallPwaButton size="default" class="rounded-sm" />
            <Button href="/install-pwa" variant="ghost" size="default" class="rounded-sm text-muted-foreground hover:text-foreground">
              How it works
            </Button>
          </div>
        </div>

        {#if !isMobile}
        <ul class="grid grid-cols-1 gap-4 md:grid-cols-3">
          {#each platforms as platform, i (platform.id)}
            {@const Icon = platform.icon}
            {@const isDetected = detectedOS === platform.id}
            <li
              class={cn(
                "flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors",
                isDetected && "border-primary/40 bg-primary/5"
              )}
              in:fly={{
                y: 12,
                duration: 480,
                delay: 100 + i * 80,
                easing: cubicOut,
              }}
            >
              <div class="flex items-start justify-between gap-3">
                <span
                  class={cn(
                    "inline-flex size-9 items-center justify-center rounded-sm",
                    isDetected
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-foreground"
                  )}
                >
                  <Icon class="size-4" />
                </span>
                {#if isDetected}
                  <span
                    class="inline-flex items-center gap-1.5 rounded-sm bg-primary/10 px-2 py-0.5 label-eyebrow text-primary"
                  >
                    <span class="size-1 rounded-full bg-primary"></span>
                    Detected
                  </span>
                {/if}
              </div>

              <div class="flex flex-col gap-1">
                <h3 class="text-xl font-medium tracking-tight text-foreground">
                  {platform.name}
                </h3>
                <p class="text-caption text-muted-foreground">
                  {platform.requirement}
                </p>
              </div>

              <div class="mt-auto flex flex-col gap-2">
                <a
                  href={platform.primary.url ?? undefined}
                  aria-disabled={!platform.primary.url}
                  class={cn(
                    "group flex items-center justify-between rounded-sm border border-border bg-background px-4 py-3 text-body-sm font-medium text-foreground transition-colors",
                    platform.primary.url
                      ? "hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                      : "pointer-events-none opacity-50"
                  )}
                >
                  <span class="flex flex-col gap-0.5">
                    <span>{platform.primary.label}</span>
                    {#if platform.primary.tag}
                      <span
                        class="label-eyebrow text-muted-foreground"
                      >
                        {platform.primary.tag}
                      </span>
                    {/if}
                  </span>
                  <ArrowDownToLine
                    class="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-y-0.5 group-hover:text-primary"
                  />
                </a>

                {#each platform.secondary as opt (opt.label)}
                  <a
                    href={opt.url ?? undefined}
                    aria-disabled={!opt.url}
                    class={cn(
                      "group flex items-center justify-between rounded-sm px-4 py-2.5 text-body-sm text-muted-foreground transition-colors",
                      opt.url
                        ? "hover:bg-muted/60 hover:text-foreground"
                        : "pointer-events-none opacity-50"
                    )}
                  >
                    <span class="flex items-baseline gap-2">
                      <span>{opt.label}</span>
                      {#if opt.tag}
                        <span
                          class="label-eyebrow text-muted-foreground"
                        >
                          {opt.tag}
                        </span>
                      {/if}
                    </span>
                    <ArrowDownToLine
                      class="size-3.5 shrink-0 opacity-0 transition-all duration-300 group-hover:translate-y-0.5 group-hover:opacity-100"
                    />
                  </a>
                {/each}
              </div>
            </li>
          {/each}
        </ul>

        {/if}
      </div>
    </section>

    {#if !isMobile}
    <section class="px-5 pb-32 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div
          class="mb-10 flex items-baseline justify-between border-b border-border pb-4"
        >
          <div class="flex flex-col gap-2">
            <span
              class="label-eyebrow text-primary"
            >
              Notes
            </span>
            <h2
              class="text-heading text-foreground sm:text-heading-lg"
            >
              About these builds.
            </h2>
          </div>
        </div>

        <dl class="divide-y divide-border rounded-md border border-border bg-muted/20">
          {#each [
            ["Version", data.version],
            ["License", "GPL-3.0-only · open source"],
            ["Engine", "Tauri 2 · Rust core, system webview"],
            ["Updates", "Manual. The app does not auto-update or call home."],
            ["Signing", "Self-issued certificates · SmartScreen / Gatekeeper warnings expected on first launch"],
            ["Verify", "Compare SHA-256 against the GitHub release assets"],
          ] as [label, value], i}
            <div
              class="grid grid-cols-3 gap-4 px-5 py-4 sm:grid-cols-4"
              in:fly={{
                y: 8,
                duration: 420,
                delay: 80 + i * 40,
                easing: cubicOut,
              }}
            >
              <dt
                class="col-span-1 label-eyebrow text-muted-foreground"
              >
                {label}
              </dt>
              <dd class="col-span-2 text-body-sm text-foreground sm:col-span-3">
                {value}
              </dd>
            </div>
          {/each}
        </dl>

        <div
          class="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-body-sm text-muted-foreground">
            Prefer the web app? Every tool runs in the browser too.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button
              href="/#tools"
              variant="outline"
              class="rounded-sm"
            >
              Use in browser
            </Button>
            <Button
              href={`${config.github}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Github size={16} />
              View on GitHub
            </Button>
          </div>
        </div>
      </div>
    </section>
    {/if}
  </main>

  <Footer />
</div>
