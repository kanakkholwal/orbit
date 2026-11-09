<script lang="ts">
  import InstallPwaButton from "$components/common/install-pwa-button.svelte";
  import Seo from "$components/Seo.svelte";
  import { BrandPanel, FaqList, RailFrame, RailRow } from "$components/site";
  import { Badge } from "$components/ui/badge";
  import { Button } from "$components/ui/button";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$components/ui/tabs";
  import { config } from "$constants/app";
  import {
    IconApple as Apple,
    IconArrowBarToDown as Download,
    IconBrandGithub as Github,
    IconDeviceDesktop as Monitor,
    IconDeviceMobile as Smartphone,
    IconShieldCheck as Shield,
    IconTerminal as Terminal,
    IconWifiOff as Offline,
  } from "$lib/icons";
  import { pwa } from "$lib/pwa.svelte";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import type { Downloads } from "./+page";

  type OS = "macOS" | "Windows" | "Linux" | "Unknown";

  let { data } = $props();
  let detectedOS = $state<OS>("Unknown");
  let installTab = $state<string>("Windows");

  $effect(() => {
    if (pwa.platform === "ios" || pwa.platform === "android") return;
    const ua = window.navigator.userAgent;
    detectedOS = ua.includes("Mac") ? "macOS" : ua.includes("Win") ? "Windows" : ua.includes("Linux") ? "Linux" : "Unknown";
    if (detectedOS !== "Unknown") installTab = detectedOS;
  });

  const isMobile = $derived(pwa.platform === "ios" || pwa.platform === "android");
  const downloads = $derived(data.downloads as Downloads);

  type Option = { label: string; asset: Downloads[keyof Downloads]; tag: string };
  type Platform = { id: Exclude<OS, "Unknown">; name: string; icon: typeof Apple; requirement: string; options: Option[] };

  const platforms = $derived<Platform[]>([
    {
      id: "Windows",
      name: "Windows",
      icon: Monitor,
      requirement: "Windows 10 or later, 64-bit",
      options: [
        { label: "Installer", asset: downloads.windowsExe, tag: ".exe" },
        { label: "MSI package", asset: downloads.windowsMsi, tag: ".msi" },
      ],
    },
    {
      id: "macOS",
      name: "macOS",
      icon: Apple,
      requirement: "macOS 10.13 or later",
      options: [
        { label: "Apple Silicon", asset: downloads.macosAppleSilicon, tag: ".dmg" },
        { label: "Intel", asset: downloads.macosIntel, tag: ".dmg" },
      ],
    },
    {
      id: "Linux",
      name: "Linux",
      icon: Terminal,
      requirement: "Ubuntu 20+, Debian 10+, Fedora 36+",
      options: [
        { label: "AppImage", asset: downloads.linuxAppImage, tag: ".AppImage" },
        { label: "Debian", asset: downloads.linuxDeb, tag: ".deb" },
        { label: "Red Hat", asset: downloads.linuxRpm, tag: ".rpm" },
      ],
    },
  ]);

  const detected = $derived(platforms.find((p) => p.id === detectedOS));
  const primary = $derived(detected?.options.find((o) => o.asset) ?? null);
  const heroOS = $derived(isMobile ? (pwa.platform === "ios" ? "iOS" : "Android") : detected ? detected.name : "desktop");

  const published = $derived(
    data.published ? new Date(data.published).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null
  );

  const steps: Record<Exclude<OS, "Unknown">, string[]> = {
    Windows: [
      "Download the installer and open it.",
      "If SmartScreen says Windows protected your PC, choose More info, then Run anyway. The installers are self-signed.",
      "Follow the prompts, then open Orbit from the Start menu.",
    ],
    macOS: [
      "Download the .dmg for your Mac: Apple Silicon for M-series chips, Intel for older Macs.",
      "Drag Orbit into Applications. The first time, right-click the app and choose Open.",
      "If macOS blocks it, allow it in System Settings, then Privacy and Security.",
    ],
    Linux: [
      "Download the AppImage, .deb or .rpm that fits your distribution.",
      "For the AppImage, mark it executable (chmod +x) and run it. For .deb or .rpm, install with your package manager.",
      "Launch Orbit from your applications menu.",
    ],
  };

  const facts = $derived([
    ["Version", data.version],
    ...(published ? [["Released", published]] : []),
    ["Price", "Free, with no account"],
    ["Updates", "Manual. The app never updates itself or calls home."],
    ["Verify", "Compare the SHA-256 checksum with the GitHub release."],
  ]);

  const features = [
    { icon: Shield, title: "Files never leave", body: "Every tool runs on your computer. There is no upload step to opt out of." },
    { icon: Offline, title: "Works offline", body: "Open the app on a plane or behind a firewall. No internet needed after install." },
    { icon: Monitor, title: "A real app", body: "Its own window, its own launcher, and files open straight from your desktop." },
  ];

  const faqs = [
    { q: "Is the desktop app free?", a: "Yes. Orbit is free and open source, with no account, no ads in the app and no watermark." },
    { q: "Why does my system warn me when I install?", a: "The installers are self-signed, not signed with a paid certificate, so Windows SmartScreen and macOS Gatekeeper warn on first launch. You can compare the SHA-256 checksum with the one on the GitHub release before you run it." },
    { q: "Does the desktop app upload my files?", a: "No. It processes files locally, the same as the website, and it does not call home or update itself." },
    { q: "What is the difference from the website?", a: "The tools are the same. The desktop app adds its own window, opening PDFs from your desktop, and works with no browser at all." },
    { q: "Can I use Orbit on a phone?", a: "Yes. Add it to your home screen from the browser and it works offline. See the install steps page for iOS and Android." },
  ];

  const jsonLd = $derived([
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: config.appName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Windows, macOS, Linux",
      softwareVersion: data.version,
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      downloadUrl: data.releaseUrl,
      url: `https://${config.appDomain}/download`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ]);

  const sizeOf = (asset: Option["asset"]) => (asset ? formatBytes(asset.size) : "Not in this release");
</script>

<Seo
  title="Download the Desktop App for Windows, macOS and Linux"
  description={`Download ${config.appName} for Windows, macOS and Linux. Free, offline PDF tools that never upload your files.`}
  keywords={[...config.appKeywords, "download orbit", "orbit pdf download", "offline pdf tools desktop"]}
  {jsonLd}
/>

<RailFrame>
  <RailRow divider={false} label="Download" class="pt-12 md:pt-20">
    <div class="rise flex flex-col items-start gap-5">
      <Badge variant="secondary">
        Latest release {data.version}{published ? ` · ${published}` : ""}
      </Badge>
      <h1 class="max-w-3xl text-balance text-4xl font-medium text-foreground md:text-6xl">
        Orbit for <span class="text-primary">{heroOS}</span>
      </h1>
      <p class="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
        {isMobile
          ? "No app store needed. Add Orbit to your home screen and it works offline, without ever uploading your files."
          : "Free installers for every major platform. No account, and your documents never leave your computer."}
      </p>
      <div class="flex flex-wrap items-center gap-3">
        {#if isMobile}
          <InstallPwaButton variant="default" size="lg" />
          <Button href="/install-pwa" variant="secondary" size="lg"><Smartphone />Install steps</Button>
        {:else if primary?.asset}
          <Button href={primary.asset.url} size="lg">
            <Download />
            Download for {detected?.name}
            <span class="text-xs font-normal opacity-80">{primary.tag} · {formatBytes(primary.asset.size)}</span>
          </Button>
          <Button href="#all-platforms" variant="secondary" size="lg">Other platforms</Button>
        {:else}
          <Button href="#all-platforms" size="lg">Choose your platform</Button>
        {/if}
      </div>
    </div>
  </RailRow>

  {#if !isMobile}
    <RailRow id="all-platforms" label="Platforms">
      <div class="flex flex-col gap-6">
        <h2 class="text-3xl font-medium text-foreground">All platforms</h2>
        <ul class="grid gap-3 md:grid-cols-3">
          {#each platforms as platform (platform.id)}
            {@const isDetected = detectedOS === platform.id}
            <li class={cn("rounded-2xl border bg-background p-1", isDetected ? "border-primary" : "border-border")}>
              <div class="flex h-full flex-col gap-4 rounded-[11px] bg-card p-5">
                <div class="flex items-center gap-3">
                  <span class="grid size-10 place-items-center rounded-xl border border-border bg-background">
                    <platform.icon class="size-5 text-foreground" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <h3 class="flex items-center gap-2 text-base font-medium text-foreground">
                      {platform.name}
                      {#if isDetected}<Badge>Your system</Badge>{/if}
                    </h3>
                    <p class="text-xs text-muted-foreground">{platform.requirement}</p>
                  </div>
                </div>
                <ul class="flex flex-col gap-2">
                  {#each platform.options as opt (opt.label)}
                    <li>
                      <a
                        href={opt.asset?.url}
                        aria-disabled={!opt.asset}
                        class={cn(
                          "flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition-colors duration-(--duration-fast) focus-visible:ring-2 focus-visible:ring-ring",
                          opt.asset ? "hover:border-border-strong" : "pointer-events-none opacity-50"
                        )}
                      >
                        <span class="flex flex-col">
                          <span class="font-medium text-foreground">{opt.label}</span>
                          <span class="text-xs text-muted-foreground">{opt.tag} · {sizeOf(opt.asset)}</span>
                        </span>
                        <Download class="size-4 text-muted-foreground" />
                      </a>
                    </li>
                  {/each}
                </ul>
              </div>
            </li>
          {/each}
        </ul>
        <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>Prefer the browser?</span>
          <InstallPwaButton variant="outline" size="sm" />
          <Button href="/install-pwa" variant="ghost" size="sm">How installing a web app works</Button>
        </div>
      </div>
    </RailRow>
  {/if}

  <RailRow label="Why the desktop app">
    <ul class="grid gap-3 md:grid-cols-3">
      {#each features as feature (feature.title)}
        <li class="rounded-2xl border border-border bg-background p-1">
          <div class="flex h-full flex-col gap-3 rounded-[11px] bg-card p-5">
            <span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><feature.icon class="size-5" /></span>
            <h3 class="text-base font-medium text-foreground">{feature.title}</h3>
            <p class="text-sm text-muted-foreground">{feature.body}</p>
          </div>
        </li>
      {/each}
    </ul>
  </RailRow>

  {#if !isMobile}
    <RailRow label="Install steps">
      <div class="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <div class="flex flex-col gap-2">
          <h2 class="text-3xl font-medium text-foreground">Install in a minute</h2>
          <p class="text-sm text-muted-foreground">Installers are self-signed, so your system may ask you to confirm on first launch.</p>
        </div>
        <Tabs bind:value={installTab} variant="underline">
          <TabsList>
            {#each platforms as platform (platform.id)}
              <TabsTrigger value={platform.id}>{platform.name}</TabsTrigger>
            {/each}
          </TabsList>
          {#each platforms as platform (platform.id)}
            <TabsContent value={platform.id}>
              <ol class="mt-4 flex flex-col gap-2">
                {#each steps[platform.id] as step, i (step)}
                  <li class="flex gap-4 rounded-xl border border-border bg-background px-4 py-3">
                    <span class="text-sm font-semibold tabular-nums text-primary">{String(i + 1).padStart(2, "0")}</span>
                    <span class="text-sm text-muted-foreground">{step}</span>
                  </li>
                {/each}
              </ol>
            </TabsContent>
          {/each}
        </Tabs>
      </div>
    </RailRow>

    <RailRow label="About these builds">
      <div class="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <h2 class="text-3xl font-medium text-foreground">About these builds</h2>
        <dl class="divide-y divide-border rounded-2xl border border-border bg-background px-5">
          {#each facts as [label, value] (label)}
            <div class="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <dt class="shrink-0 text-sm text-muted-foreground">{label}</dt>
              <dd class="text-sm font-medium text-foreground sm:text-right">{value}</dd>
            </div>
          {/each}
        </dl>
      </div>
    </RailRow>
  {/if}

  <RailRow label="Questions">
    <div class="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <h2 class="text-3xl font-medium text-foreground">Questions</h2>
      <FaqList items={faqs} variant="cards" />
    </div>
  </RailRow>

  <RailRow label="Use in browser">
    <BrandPanel title="Rather not install anything?" body="Every tool runs right in your browser, with the same privacy.">
      {#snippet actions()}
        <Button href="/explore" variant="secondary">Use in browser</Button>
        <Button href={data.releaseUrl} target="_blank" rel="noopener noreferrer" variant="dark">
          All releases
          <Github />
        </Button>
      {/snippet}
    </BrandPanel>
  </RailRow>
</RailFrame>
