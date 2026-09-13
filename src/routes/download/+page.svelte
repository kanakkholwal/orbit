<script lang="ts">
  import InstallPwaButton from "$components/common/install-pwa-button.svelte";
  import { BrandPanel, PageHero, RailFrame, RailRow, SplitSection } from "$components/site";
  import Seo from "$components/Seo.svelte";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { pwa } from "$lib/pwa.svelte";
  import { cn } from "$lib/utils";
  import {
    IconApple as Apple,
    IconArrowBarToDown as ArrowDownToLine,
    IconBrandGithub as Github,
    IconDeviceDesktop as Monitor,
    IconDeviceMobile as Smartphone,
    IconTerminal as Terminal,
  } from "@tabler/icons-svelte";

  type OS = "macOS" | "Windows" | "Linux" | "Unknown";

  let { data } = $props();
  let detectedOS = $state<OS>("Unknown");

  $effect(() => {
    const ua = window.navigator.userAgent;
    if (pwa.platform === "ios" || pwa.platform === "android") return;
    if (ua.includes("Mac")) detectedOS = "macOS";
    else if (ua.includes("Win")) detectedOS = "Windows";
    else if (ua.includes("Linux")) detectedOS = "Linux";
  });

  let isMobile = $derived(pwa.platform === "ios" || pwa.platform === "android");

  const downloadKeywords = [...config.appKeywords, "download orbit", "orbit pdf download", "offline pdf tools desktop"];

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
      primary: { label: "Apple Silicon", url: data.downloads.macosAppleSilicon, tag: ".dmg" },
      secondary: [{ label: "Intel", url: data.downloads.macosIntel, tag: ".dmg" }],
    },
    {
      id: "Windows",
      name: "Windows",
      icon: Monitor,
      requirement: "Windows 10 or later, 64-bit",
      primary: { label: "Installer", url: data.downloads.windowsExe, tag: ".exe" },
      secondary: [{ label: "MSI package", url: data.downloads.windowsMsi, tag: ".msi" }],
    },
    {
      id: "Linux",
      name: "Linux",
      icon: Terminal,
      requirement: "Ubuntu 20+, Debian 10+, Fedora 36+",
      primary: { label: "AppImage", url: data.downloads.linuxAppImage, tag: ".AppImage" },
      secondary: [
        { label: "Debian", url: data.downloads.linuxDeb, tag: ".deb" },
        { label: "Red Hat", url: data.downloads.linuxRpm, tag: ".rpm" },
      ],
    },
  ]);

  const primaryDownload = $derived.by(() => {
    switch (detectedOS) {
      case "macOS":
        return { link: data.downloads.macosAppleSilicon, label: "Download for macOS" };
      case "Windows":
        return { link: data.downloads.windowsExe ?? data.downloads.windowsMsi, label: "Download for Windows" };
      case "Linux":
        return { link: data.downloads.linuxAppImage ?? data.downloads.linuxDeb, label: "Download for Linux" };
      default:
        return { link: null, label: "Choose your platform" };
    }
  });

  const heroAccent = $derived(
    isMobile ? `for ${pwa.platform === "ios" ? "iOS" : "Android"}` : detectedOS !== "Unknown" ? `for ${detectedOS}` : "for desktop"
  );

  const notes = $derived([
    ["Version", data.version],
    ["Price", "Free, with no account"],
    ["Updates", "Manual. The app never updates itself or calls home."],
    ["Security warning", "Installers are self-signed, so your system may warn on first launch."],
    ["Verify", "Compare the SHA-256 checksum with the GitHub release"],
  ]);
</script>

<Seo
  title="Download the Desktop App for Windows, macOS and Linux"
  description={`Download ${config.appName} for Windows, macOS and Linux. Free, offline PDF tools that never upload your files.`}
  keywords={downloadKeywords}
/>

<RailFrame>
  <RailRow divider={false} label="Download">
    <PageHero
      badge={`Latest release ${data.version}`}
      title={`Get ${config.appName}`}
      accent={heroAccent}
      lede={isMobile
        ? "No app store needed. Add Orbit to your home screen and it works offline, without ever uploading your files."
        : "Free installers for every major platform. No account, no ads in the app, and your documents never leave your computer."}
    >
      {#snippet actions()}
        {#if isMobile}
          <InstallPwaButton variant="primary" size="default" />
          <Button href="/install-pwa">
            <Smartphone />
            Install steps
          </Button>
        {:else if primaryDownload.link}
          <Button href={primaryDownload.link} variant="primary">
            <ArrowDownToLine />
            {primaryDownload.label}
          </Button>
          <Button href="#all-platforms">All platforms</Button>
        {:else}
          <Button href="#all-platforms" variant="primary">{primaryDownload.label}</Button>
        {/if}
      {/snippet}
    </PageHero>
  </RailRow>

  <RailRow id="all-platforms" label="Platforms">
    <SplitSection
      title={isMobile ? "Install on" : "Pick your"}
      accent={isMobile ? "this device" : "platform"}
      description="The web app works everywhere. The desktop app adds a real launcher and works with no browser at all."
    >
      <ul class="flex flex-col gap-3">
        <li class="panel-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <span class="grid size-10 shrink-0 place-items-center rounded-lg border border-border">
            <Smartphone class="size-5 text-primary" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="text-body-lg font-medium text-foreground">Web app</h3>
            <p class="mt-1 text-body text-muted-foreground">Any modern browser, on phone, tablet or computer.</p>
          </div>
          <div class="flex shrink-0 flex-wrap items-center gap-2">
            <Button href="/install-pwa" variant="ghost">How it works</Button>
            <InstallPwaButton variant="outline" size="default" />
          </div>
        </li>

        {#if !isMobile}
          {#each platforms as platform (platform.id)}
            {@const isDetected = detectedOS === platform.id}
            <li
              class={cn(
                "panel-card grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 p-5 sm:p-6",
                isDetected && "border-primary"
              )}
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-lg border border-border">
                <platform.icon class="size-5 text-foreground" />
              </span>
              <div class="min-w-0 flex-1">
                <h3 class="flex items-center gap-2 text-body-lg font-medium text-foreground">
                  {platform.name}
                  {#if isDetected}
                    <span class="rounded-full bg-primary/10 px-2 py-0.5 text-caption font-medium text-primary">
                      Your system
                    </span>
                  {/if}
                </h3>
                <p class="mt-1 text-body text-muted-foreground">{platform.requirement}</p>
              </div>
              <div class="col-span-2 flex flex-wrap items-center gap-2 sm:col-start-2 sm:col-end-3">
                {#each [platform.primary, ...platform.secondary] as opt, i (opt.label)}
                  <Button
                    href={opt.url ?? undefined}
                    disabled={!opt.url}
                    variant={i === 0 ? (isDetected ? "primary" : "outline") : "ghost"}
                    class="gap-1.5"
                  >
                    <ArrowDownToLine />
                    {opt.label}
                    {#if opt.tag}
                      <span class="text-caption font-normal">{opt.tag}</span>
                    {/if}
                  </Button>
                {/each}
              </div>
            </li>
          {/each}
        {/if}
      </ul>
    </SplitSection>
  </RailRow>

  {#if !isMobile}
    <RailRow label="About these builds">
      <SplitSection title="About these" accent="builds" description="What to expect when you install.">
        <dl class="panel-card divide-y divide-border px-6">
          {#each notes as [label, value] (label)}
            <div class="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <dt class="shrink-0 text-body text-muted-foreground">{label}</dt>
              <dd class="text-body font-medium text-foreground sm:text-right">{value}</dd>
            </div>
          {/each}
        </dl>
      </SplitSection>
    </RailRow>
  {/if}

  <RailRow label="Use in browser">
    <BrandPanel title="Rather not install anything?" body="Every tool runs right in your browser, with the same privacy.">
      {#snippet actions()}
        <Button href="/explore" variant="ink">Use in browser</Button>
        <Button href={`${config.github}/releases`} target="_blank" rel="noopener noreferrer" variant="light">
          All releases
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
