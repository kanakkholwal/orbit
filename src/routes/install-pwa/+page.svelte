<script lang="ts">
  import { BrandPanel, PageHero, RailFrame, RailRow, SplitSection } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
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
    IconDeviceDesktopDown as HardDriveDownload,
    IconDeviceDesktop as Monitor,
    IconDeviceMobile as Smartphone,
    IconDownload as Download,
    IconRefresh as Refresh,
    IconRocket as Rocket,
    IconStack2 as Layers,
    IconWifiOff as WifiOff,
  } from "@tabler/icons-svelte";
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
      title: "iPhone and iPad",
      icon: Apple,
      when: (p, b) => p === "ios" && (b === "safari" || b === "other"),
      steps: [
        { title: "Tap the Share button", body: "It's the square with an arrow at the bottom of Safari." },
        { title: "Choose \"Add to Home Screen\"", body: "Scroll down the list if you don't see it straight away." },
        { title: "Tap \"Add\"", body: "Orbit appears on your home screen and opens like any other app." },
      ],
    },
    {
      id: "android-chrome",
      title: "Android",
      icon: Smartphone,
      when: (p, b) => p === "android" && (b === "chromium" || b === "samsung" || b === "other"),
      steps: [
        { title: "Open the browser menu", body: "Tap the three dots in the top-right corner of Chrome or Edge." },
        { title: "Choose \"Install app\"", body: "On some phones it says \"Add to Home screen\" instead." },
        { title: "Confirm", body: "Orbit opens in its own window, without the browser around it." },
      ],
    },
    {
      id: "desktop-chromium",
      title: "Chrome or Edge on a computer",
      icon: Monitor,
      when: (p, b) => p === "desktop" && b === "chromium",
      steps: [
        { title: "Click the install icon", body: "Look for the small screen-with-arrow icon at the right of the address bar." },
        { title: "Or use the menu", body: "Open the three-dot menu and choose \"Install Orbit PDF\"." },
        { title: "Open it from your dock", body: "Orbit is added to your Start menu or Dock and opens in its own window." },
      ],
    },
    {
      id: "firefox",
      title: "Firefox",
      icon: Smartphone,
      when: (_p, b) => b === "firefox",
      steps: [
        { title: "Use the desktop app on a computer", body: "Firefox can't install web apps on desktop, but our desktop app works the same way." },
        { title: "On Android", body: "Open the menu and choose \"Install\" or \"Add to Home Screen\"." },
      ],
    },
  ];

  const fallbackGuide: Guide = {
    id: "generic",
    title: "Other browsers",
    icon: HardDriveDownload,
    when: () => true,
    steps: [
      { title: "Look for an install option", body: "Most browsers offer \"Install\" or \"Add to Home Screen\" in their main menu." },
      { title: "Or use the desktop app", body: "If your browser can't install web apps, the desktop app gives you the same offline tools." },
    ],
  };

  let activeGuide = $derived(guides.find((g) => g.when(pwa.platform, pwa.browserKind)) ?? fallbackGuide);

  const features = [
    { icon: WifiOff, label: "Works offline", body: "Every tool keeps working with no internet connection." },
    { icon: Rocket, label: "Opens instantly", body: "Launch it from your home screen or dock like any app." },
    { icon: Layers, label: "Its own window", body: "No tabs and no address bar, just your tools." },
    { icon: Refresh, label: "Stays up to date", body: "New versions download quietly and apply on the next launch." },
  ];

  let statusLabel = $derived.by(() => {
    if (!pwa.ready) return "Checking your browser";
    if (pwa.installed) return "Already installed";
    if (canInstallNatively()) return "Ready to install";
    if (needsManualInstall()) return "Install from your browser menu";
    return "Install from your browser menu";
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
      document.getElementById("how-to-install")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  title="Install as a Web App"
  description={`Install ${config.appName} on iOS, Android, Windows, macOS or Linux. Works offline, needs no account, and your files never leave your device.`}
  keywords={[...config.appKeywords, "install pwa", "add to home screen", "orbit pdf pwa"]}
/>

<RailFrame>
  <RailRow divider={false} label="Install Orbit">
    <PageHero
      badge={statusLabel}
      title={`Install ${config.appName}`}
      accent="on any device"
      lede="Phones, tablets and computers. Add Orbit straight from your browser, no app store and no account needed."
    >
      {#snippet actions()}
        <Button variant="primary" onclick={onInstallClick} disabled={busy || !pwa.ready}>
          {#if pwa.installed}
            <ArrowUpRight />
          {:else}
            <Download />
          {/if}
          {primaryLabel}
        </Button>
        <Button href="/download">Desktop app</Button>
      {/snippet}
    </PageHero>
  </RailRow>

  <RailRow id="how-to-install" label="How to install">
    <SplitSection title="How to" accent="install" description={`Steps for ${activeGuide.title}.`} sticky>
      {#snippet aside()}
        <div class="flex flex-col gap-2">
          <span class="text-caption font-medium text-muted-foreground">Using something else?</span>
          <div class="flex flex-wrap gap-2">
            {#each guides as g (g.id)}
              {#if g.id !== activeGuide.id}
                <Button variant="outline" size="sm" onclick={() => (activeGuide = g)}>
                  <g.icon />
                  {g.title}
                </Button>
              {/if}
            {/each}
          </div>
        </div>
      {/snippet}

      <ol class="flex flex-col gap-3">
        {#each activeGuide.steps as step, i (step.title)}
          <li class="panel-card flex gap-4 px-6 py-5">
            <span class="text-body font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h3 class="text-body-lg font-medium text-foreground">{step.title}</h3>
              <p class="mt-1 text-body leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          </li>
        {/each}
      </ol>
    </SplitSection>
  </RailRow>

  <RailRow label="Why install">
    <SplitSection title="Why" accent="install it" description="The same private tools, a little closer at hand.">
      <ul class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {#each features as f (f.label)}
          <li class="panel-card flex flex-col gap-3 p-6">
            <span class="grid size-10 place-items-center rounded-lg border border-border">
              <f.icon class="size-5 text-primary" />
            </span>
            <h3 class="text-body-lg font-medium text-foreground">{f.label}</h3>
            <p class="text-body leading-relaxed text-muted-foreground">{f.body}</p>
          </li>
        {/each}
      </ul>
    </SplitSection>
  </RailRow>

  <RailRow label="Desktop app">
    <BrandPanel
      title="Prefer a desktop app?"
      body="Installers for Windows, macOS and Linux give you the same offline tools with a real launcher."
    >
      {#snippet actions()}
        <Button href="/download" variant="light">
          <ArrowDownToLine />
          Get the desktop app
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
