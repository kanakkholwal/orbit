<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import SponsorCard from "$components/common/SponsorCard.svelte";
  import { OptionGroup, OptionToggle, SegmentedControl, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Progress } from "$components/ui/progress";
  import { Slider } from "$components/ui/slider";
  import { IconCheck as Check } from "$lib/icons";
  import { clearRecentTools } from "$lib/runtime/recent-tools.svelte";
  import { offlineStatus, warmAllEngines, type OfflineStatus } from "$lib/engine-warmup";
  import { deviceProfile, formatCap, TIER_LABEL } from "$lib/device-profile.svelte";
  import { settings, type DefaultFormats } from "$lib/settings/settings.svelte";
  import { formatBytes, offlineStorage } from "$lib/settings/storage.svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  const formatKinds: { key: keyof DefaultFormats; label: string; options: string[] }[] = [
    { key: "image", label: "Images", options: ["webp", "jpg", "png", "avif"] },
    { key: "audio", label: "Audio", options: ["mp3", "wav", "ogg", "flac"] },
    { key: "video", label: "Video", options: ["mp4", "webm", "gif"] },
    { key: "document", label: "Documents", options: ["docx", "md", "html", "txt"] },
  ];

  let ready = $state(false);

  onMount(() => {
    settings.load();
    offlineStorage.refresh();
    void deviceProfile.init();
    void refreshPack();
    ready = true;
  });

  // Persist every change, but not before the stored values are loaded.
  $effect(() => {
    $state.snapshot(settings.value);
    if (ready) settings.save();
  });

  const preview = $derived(settings.outputName("holiday photo.heic", settings.value.defaultFormats.image));
  const deviceRows = $derived([
    ["Performance", TIER_LABEL[deviceProfile.tier]],
    ["Memory", deviceProfile.memoryGB ? `${deviceProfile.memoryGB} GB` : "Not reported"],
    ["Processor cores", String(deviceProfile.cores)],
    ["Large outputs", deviceProfile.streaming ? "Saved to disk" : "Held in memory"],
    ["Largest video", formatCap(deviceProfile.capFor("video"))],
    ["Largest audio file", formatCap(deviceProfile.capFor("audio"))],
    ["Largest photo", formatCap(deviceProfile.capFor("image"))],
  ]);
  const usagePct = $derived(
    offlineStorage.quota ? Math.min(100, (offlineStorage.usage / offlineStorage.quota) * 100) : 0
  );

  async function persist() {
    const ok = await offlineStorage.requestPersistence();
    if (ok) toast.success("Offline data protected", { description: "The browser will not evict cached engines." });
    else toast.info("Browser declined", { description: "Installing Orbit as an app usually helps." });
  }

  let warming = $state<{ done: number; total: number } | null>(null);
  let pack = $state<OfflineStatus | null>(null);
  const refreshPack = async () => (pack = await offlineStatus());

  // With "ask before large downloads" on, the first press names the size and a second press confirms.
  let confirming = $state(false);
  let confirmTimer: ReturnType<typeof setTimeout> | undefined;

  async function makeOffline(force = false) {
    if (settings.value.confirmLargeDownloads && !confirming && pack && pack.done < pack.total) {
      confirming = true;
      clearTimeout(confirmTimer);
      confirmTimer = setTimeout(() => (confirming = false), 6000);
      return;
    }
    confirming = false;
    warming = { done: 0, total: pack?.total ?? 1 };
    await offlineStorage.requestPersistence();
    await warmAllEngines((done, total) => (warming = { done, total }), force);
    warming = null;
    await offlineStorage.refresh();
    await refreshPack();
    if (pack?.ready) toast.success("Ready offline", { description: "Every tool now works without internet." });
    else {
      // On a first visit the service worker is not in control yet, so large files are not kept until a reload.
      const needsReload = "serviceWorker" in navigator && !navigator.serviceWorker.controller;
      toast.warning("Not everything is stored yet", {
        description: needsReload ? "Reload this page once, then press the button again." : "Check your connection and press the button again.",
      });
    }
  }

  async function clearOffline() {
    await offlineStorage.clearCaches();
    await refreshPack();
    toast.success("Offline engines cleared", { description: "They download again on next use." });
  }

  function resetAll() {
    settings.reset();
    clearRecentTools();
    toast.success("Settings reset.");
  }
</script>

<Seo title="Settings" description="Filename template, default formats, offline storage and privacy options for Orbit." noindex />

<div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-24 pt-8 md:px-6">
  <header class="rise flex flex-col gap-1">
    <h1 class="text-2xl font-medium text-foreground">Settings</h1>
    <p class="text-sm text-muted-foreground">Saved on this device only. Nothing here is sent anywhere.</p>
  </header>

  <!-- Bento: one column on phones, two on tablets, twelve on desktop. -->
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12">
    <ToolPanel title="File names" description="Use %name% for the original name." class="rise [--i:1] lg:col-span-7" contentClass="flex flex-col gap-2">
      <Input bind:value={settings.value.filenameTemplate} placeholder="%name%" class="min-h-11" autocomplete="off" aria-label="Output file name" />
      <p class="text-xs tabular-nums text-muted-foreground">Example: {preview}</p>
    </ToolPanel>

    <ToolPanel title="Image output" description="Lower quality is smaller. 80 to 90 looks the same for most photos." class="rise [--i:2] lg:col-span-5" contentClass="flex h-full flex-col justify-end">
      <Slider
        label="Quality"
        min={40}
        max={100}
        showValue
        value={settings.value.imageQuality}
        onValueChange={(v) => (settings.value.imageQuality = Array.isArray(v) ? v[0] : v)}
      />
    </ToolPanel>

    <ToolPanel title="Default formats" description="Picked first in each converter." class="rise [--i:3] md:col-span-2 lg:col-span-12" contentClass="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each formatKinds as kind (kind.key)}
        <OptionGroup label={kind.label}>
          <SegmentedControl
            name={`${kind.label} format`}
            size="sm"
            options={kind.options.map((o) => ({ value: o, label: o.toUpperCase() }))}
            bind:value={settings.value.defaultFormats[kind.key]}
          />
        </OptionGroup>
      {/each}
    </ToolPanel>

    <ToolPanel title="Offline" description="Engines download once, then work without internet." class="rise [--i:4] lg:col-span-7" contentClass="flex flex-col gap-4">
      {#if offlineStorage.supported}
        <div class="flex flex-col gap-2">
          <Progress value={usagePct} max={100} size="sm" label="Offline storage used" />
          <p class="text-xs tabular-nums text-muted-foreground">
            {formatBytes(offlineStorage.usage)} of {formatBytes(offlineStorage.quota)}
            {offlineStorage.persisted ? "· protected from eviction" : ""}
          </p>
        </div>
      {:else}
        <p class="text-sm text-muted-foreground">This browser does not report storage use.</p>
      {/if}
      <div class="flex flex-col gap-0.5" aria-live="polite">
        <p class="text-sm font-medium text-foreground">
          {#if pack === null}
            Checking what is stored…
          {:else if pack.ready}
            Everything is stored on this device
          {:else}
            {pack.done} of {pack.total} engines stored
          {/if}
        </p>
        <p class="text-xs text-muted-foreground">
          Includes a 58 MB document converter.{pack?.at ? ` Last downloaded ${new Date(pack.at).toLocaleDateString()}.` : ""}
        </p>
      </div>
      <OptionToggle
        label="Ask before large downloads"
        description="Asks for a second press before the offline download, which is about 70 MB."
        bind:checked={settings.value.confirmLargeDownloads}
      />
      <div class="flex flex-wrap gap-2">
        {#if offlineStorage.supported && !offlineStorage.persisted}
          <Button variant="outline" size="sm" onclick={persist}>Keep offline data</Button>
        {/if}
        {#if pack?.ready && !warming}
          <Button variant="outline" size="sm" disabled>
            <Check />
            Ready offline
          </Button>
          <Button variant="ghost" size="sm" onclick={() => makeOffline(true)}>Download again</Button>
        {:else}
          <Button size="sm" disabled={!!warming || pack === null} onclick={() => makeOffline()}>
            {#if warming}
              Downloading {warming.done} of {warming.total}
            {:else if confirming}
              Download about 70 MB? Press again
            {:else if pack && pack.done > 0}
              Download the rest ({pack.total - pack.done} left)
            {:else}
              Make all tools work offline
            {/if}
          </Button>
        {/if}
        <Button variant="outline" size="sm" onclick={clearOffline}>Clear offline engines</Button>
      </div>
    </ToolPanel>

    <ToolPanel
    title="This device"
    description="Limits come from what your browser reports, so conversions do not run out of memory."
    class="rise [--i:5] lg:col-span-5"
  >
    <dl class="flex flex-col divide-y divide-border">
      {#each deviceRows as [label, value] (label)}
        <div class="flex items-baseline justify-between gap-4 py-2 text-sm">
          <dt class="text-muted-foreground">{label}</dt>
          <dd class="font-medium tabular-nums text-foreground">{value}</dd>
        </div>
      {/each}
    </dl>
  </ToolPanel>

  <ToolPanel title="Privacy" class="rise [--i:6] lg:col-span-5" contentClass="flex h-full flex-col justify-between gap-4">
      <OptionToggle
        label="Anonymous usage stats"
        description="Page views and tool names only. File names and contents never leave your device."
        bind:checked={settings.value.analytics}
      />
      <Button variant="outline" size="sm" class="self-start" onclick={resetAll}>Reset all settings</Button>
    </ToolPanel>

    <ToolPanel title="Support Orbit" class="rise [--i:7] md:col-span-2 lg:col-span-7">
      <SponsorCard />
    </ToolPanel>
  </div>
</div>
