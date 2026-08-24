<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { cn } from "$lib/utils";
  import {
    canInstallNatively,
    needsManualInstall,
    promptInstall,
    pwa,
    type PwaBrowser,
    type PwaPlatform,
  } from "$lib/pwa.svelte";
  import {
    IconApple as Apple,
    IconArrowBarToDown as ArrowDownToLine,
    IconArrowUpRight as ArrowUpRight,
    IconCheck as Check,
    IconChevronRight as ChevronRight,
    IconDownload as Download,
    IconDeviceDesktopDown as HardDriveDownload,
    IconStack2 as Layers,
    IconDeviceDesktop as Monitor,
    IconShare as Share,
    IconDeviceMobile as Smartphone,
    IconWifi as Wifi,
    IconBolt as Zap,
  } from "@tabler/icons-svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly } from "svelte/transition";
  import { toast } from "svelte-sonner";

  type Step = { title: string; body: string };
  type Guide = {
    id: string;
    title: string;
    icon: typeof Apple;
    when: (p: PwaPlatform, b: PwaBrowser) => boolean;
    steps: Step[];
  };

  const guides: Guide[] = [
    {
      id: "ios-safari",
      title: "iPhone / iPad · Safari",
      icon: Apple,
      when: (p, b) => p === "ios" && (b === "safari" || b === "other"),
      steps: [
        { title: "Tap the Share button", body: "It's the square with the up arrow at the bottom of Safari." },
        { title: "Pick \"Add to Home Screen\"", body: "Scroll the action sheet if you don't see it immediately." },
        { title: "Confirm \"Add\"", body: "Orbit PDF will appear on your home screen as a standalone app." },
      ],
    },
    {
      id: "android-chrome",
      title: "Android · Chrome / Edge",
      icon: Smartphone,
      when: (p, b) => p === "android" && (b === "chromium" || b === "samsung" || b === "other"),
      steps: [
        { title: "Open the browser menu", body: "Tap the three-dot icon in the top-right of Chrome (or Edge)." },
        { title: "Choose \"Install app\"", body: "On some devices it reads \"Add to Home screen\" or \"Install Orbit PDF\"." },
        { title: "Confirm install", body: "The app launches in its own window with no browser chrome." },
      ],
    },
    {
      id: "desktop-chromium",
      title: "Desktop · Chrome / Edge",
      icon: Monitor,
      when: (p, b) => p === "desktop" && b === "chromium",
      steps: [
        { title: "Click the install icon", body: "Look for the small monitor-with-arrow icon at the right end of the address bar." },
        { title: "Or open the menu", body: "Three-dot menu → \"Install Orbit PDF…\" / \"Apps → Install this site as an app\"." },
        { title: "Launch from your dock", body: "It pins to your Start menu / Dock and opens in its own window." },
      ],
    },
    {
      id: "firefox",
      title: "Firefox",
      icon: Smartphone,
      when: (_p, b) => b === "firefox",
      steps: [
        { title: "Firefox doesn't install PWAs natively", body: "On desktop, install our Tauri app instead — you'll get the same offline behavior with a real OS-level launcher." },
        { title: "On Android Firefox", body: "Open the menu → \"Install\" / \"Add to Home Screen\". The experience is more limited than Chrome." },
      ],
    },
  ];

  const fallbackGuide: Guide = {
    id: "generic",
    title: "Other browsers",
    icon: HardDriveDownload,
    when: () => true,
    steps: [
      { title: "Look for an install option", body: "Most modern browsers expose \"Install\" or \"Add to Home Screen\" in their main menu." },
      { title: "Or use the desktop app", body: "If your browser doesn't support PWAs, the Tauri-built desktop installers offer the same offline functionality." },
    ],
  };

  let activeGuide = $derived(
    guides.find((g) => g.when(pwa.platform, pwa.browserKind)) ?? fallbackGuide
  );

  const features = [
    { icon: Wifi,    label: "Works offline", body: "All processing runs on-device — no upload, no roundtrip." },
    { icon: Zap,     label: "Instant launch", body: "Cached after first visit. Opens like a native app from your home screen." },
    { icon: Layers,  label: "Standalone window", body: "No tabs, no address bar — just the toolkit." },
    { icon: HardDriveDownload, label: "Auto-updates", body: "Updates silently in the background; reload to apply." },
  ];

  let statusLabel = $derived.by(() => {
    if (!pwa.ready) return "Detecting…";
    if (pwa.installed) return "Already installed";
    if (canInstallNatively()) return "Ready to install";
    if (needsManualInstall()) return "Manual install required";
    return "Install via your browser menu";
  });

  let busy = $state(false);

  async function onInstallClick() {
    if (pwa.installed) {
      window.location.href = "/?source=pwa-open";
      return;
    }
    busy = true;
    try {
      const result = await promptInstall();
      if (result === "accepted") {
        toast.success("Orbit PDF installed");
        return;
      }
      if (result === "dismissed") {
        toast("Install cancelled");
        return;
      }
      // 'unavailable' — no captured beforeinstallprompt. Fall back to manual
      // instructions: scroll the relevant guide into view.
      document.getElementById("how-to-install")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } finally {
      busy = false;
    }
  }

  let primaryLabel = $derived.by(() => {
    if (!pwa.ready) return "Install app";
    if (pwa.installed) return "Open app";
    if (canInstallNatively()) return "Install app";
    return "See install steps";
  });
</script>

<Seo
  title={`Install ${config.appName} as a web app`}
  description={`Install ${config.appName} as a Progressive Web App on iOS, Android, Windows, macOS, or Linux. Offline-first, no account, your files never leave your device.`}
  keywords={[...config.appKeywords, "install pwa", "add to home screen", "orbit pdf pwa"]}
/>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="flex-1">
    <section class="px-5 pb-16 pt-32 md:px-8 md:pt-44 lg:pt-52">
      <div class="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div class="flex flex-wrap items-center gap-3" in:fade={{ duration: 400, delay: 60 }}>
          <span class="relative flex size-1.5 items-center justify-center" aria-hidden="true">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary/40"></span>
            <span class="relative inline-flex size-1.5 rounded-full bg-primary"></span>
          </span>
          <span class="label-eyebrow text-primary">
            Install · PWA
          </span>
          <span class="text-muted-foreground">·</span>
          <span class="label-eyebrow text-muted-foreground">
            {statusLabel}
          </span>
        </div>

        <h1
          class="max-w-3xl text-balance text-heading-lg text-foreground md:text-display"
          in:fly={{ y: 16, duration: 600, delay: 120, easing: cubicOut }}
        >
          Install {config.appName}
          <span class="text-primary">on any device.</span>
        </h1>

        <p
          class="max-w-2xl text-body-lg leading-relaxed text-muted-foreground sm:text-xl"
          in:fly={{ y: 12, duration: 520, delay: 220, easing: cubicOut }}
        >
          Phones, tablets, laptops — Orbit PDF runs as a Progressive Web App with full offline support.
          No App Store, no Play Store, no account.
        </p>

        <div
          class="flex flex-col gap-5 border-t border-border pt-10"
          in:fly={{ y: 12, duration: 520, delay: 320, easing: cubicOut }}
        >
          <div class="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span class="label-eyebrow text-muted-foreground">
              Detected
            </span>
            <span class="font-mono text-body tabular-nums text-foreground">
              {pwa.platform === "unknown" ? "—" : pwa.platform} · {pwa.browserKind}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="lg"
              class="rounded-sm bg-primary px-6 text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
              onclick={onInstallClick}
              disabled={busy || !pwa.ready}
            >
              {#if pwa.installed}
                <ArrowUpRight />
              {:else}
                <Download />
              {/if}
              {primaryLabel}
            </Button>
            <Button href="/download" variant="outline" size="lg" class="rounded-sm px-5">
              Desktop installers
            </Button>
            <Button href="/" variant="ghost" size="lg" class="rounded-sm px-5 text-muted-foreground hover:text-foreground">
              Use in browser
            </Button>
          </div>
        </div>
      </div>
    </section>

    <section id="how-to-install" class="scroll-mt-32 px-5 py-16 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div class="mb-10 flex items-baseline justify-between border-b border-border pb-4">
          <div class="flex flex-col gap-2">
            <span class="label-eyebrow text-primary">
              How to install
            </span>
            <h2 class="text-heading text-foreground sm:text-heading-lg">
              {activeGuide.title}
            </h2>
          </div>
          <span class="hidden font-mono text-caption tabular-nums text-muted-foreground sm:inline">
            01
          </span>
        </div>

        <ol class="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border/60 md:grid-cols-3">
          {#each activeGuide.steps as step, i (step.title)}
            <li
              class="flex flex-col gap-3 bg-card p-6"
              in:fly={{ y: 12, duration: 480, delay: 100 + i * 80, easing: cubicOut }}
            >
              <span class="font-mono text-caption tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 class="text-body font-medium tracking-tight text-foreground">{step.title}</h3>
              <p class="text-body leading-relaxed text-muted-foreground">{step.body}</p>
              {#if i === 0 && activeGuide.id === "ios-safari"}
                <span class="mt-1 inline-flex items-center gap-1.5 label-eyebrow text-primary">
                  <Share class="size-3" />
                  Share sheet
                </span>
              {/if}
            </li>
          {/each}
        </ol>

        <div class="mt-6 flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
          <span class="label-eyebrow text-muted-foreground">Other platforms</span>
          {#each guides as g (g.id)}
            {#if g.id !== activeGuide.id}
              <button
                type="button"
                class={cn(
                  "inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1 label-eyebrow text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                )}
                onclick={() => (activeGuide = g)}
              >
                {g.title}
                <ChevronRight class="size-3" />
              </button>
            {/if}
          {/each}
        </div>
      </div>
    </section>

    <section class="px-5 py-16 md:px-8">
      <div class="mx-auto w-full max-w-5xl">
        <div class="mb-10 flex items-baseline justify-between border-b border-border pb-4">
          <div class="flex flex-col gap-2">
            <span class="label-eyebrow text-primary">
              Why install
            </span>
            <h2 class="text-heading text-foreground sm:text-heading-lg">
              What you get.
            </h2>
          </div>
          <span class="hidden font-mono text-caption tabular-nums text-muted-foreground sm:inline">
            02
          </span>
        </div>

        <ul class="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
          {#each features as f, i (f.label)}
            {@const Icon = f.icon}
            <li
              class="flex flex-col gap-4 bg-card p-6"
              in:fly={{ y: 12, duration: 480, delay: 100 + i * 80, easing: cubicOut }}
            >
              <span class="inline-flex size-9 items-center justify-center rounded-sm bg-primary/15 text-primary">
                <Icon class="size-4" />
              </span>
              <div class="flex flex-col gap-1">
                <h3 class="text-body font-medium tracking-tight text-foreground">{f.label}</h3>
                <p class="text-body leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
              <Check class="mt-auto size-4 text-primary/70" />
            </li>
          {/each}
        </ul>

        <div class="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-body text-muted-foreground">
            Need a real desktop app instead? Tauri-built installers are signed and sit alongside this PWA.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button href="/download" variant="outline" class="rounded-sm">
              <ArrowDownToLine class="size-4" />
              Desktop installers
            </Button>
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>
