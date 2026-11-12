<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import SponsorCard from "$components/common/SponsorCard.svelte";
  import { OptionGroup, OptionToggle, SegmentedControl, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Progress } from "$components/ui/progress";
  import { Slider } from "$components/ui/slider";
  import { clearRecentTools } from "$lib/runtime/recent-tools.svelte";
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
    ready = true;
  });

  // Persist every change, but not before the stored values are loaded.
  $effect(() => {
    $state.snapshot(settings.value);
    if (ready) settings.save();
  });

  const preview = $derived(settings.outputName("holiday photo.heic", settings.value.defaultFormats.image));
  const usagePct = $derived(
    offlineStorage.quota ? Math.min(100, (offlineStorage.usage / offlineStorage.quota) * 100) : 0
  );

  async function persist() {
    const ok = await offlineStorage.requestPersistence();
    if (ok) toast.success("Offline data is now protected from eviction.");
    else toast.info("The browser declined. Installing Orbit as an app usually helps.");
  }

  async function clearOffline() {
    await offlineStorage.clearCaches();
    toast.success("Offline engines cleared. They download again on next use.");
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
      <OptionToggle
        label="Ask before large downloads"
        description="Warns before fetching engines over 20 MB, useful on mobile data."
        bind:checked={settings.value.confirmLargeDownloads}
      />
      <div class="flex flex-wrap gap-2">
        {#if offlineStorage.supported && !offlineStorage.persisted}
          <Button variant="outline" class="min-h-11" onclick={persist}>Keep offline data</Button>
        {/if}
        <Button variant="outline" class="min-h-11" onclick={clearOffline}>Clear offline engines</Button>
      </div>
    </ToolPanel>

    <ToolPanel title="Privacy" class="rise [--i:5] lg:col-span-5" contentClass="flex h-full flex-col justify-between gap-4">
      <OptionToggle
        label="Anonymous usage stats"
        description="Page views and tool names only. File names and contents never leave your device."
        bind:checked={settings.value.analytics}
      />
      <Button variant="outline" class="min-h-11 self-start" onclick={resetAll}>Reset all settings</Button>
    </ToolPanel>

    <ToolPanel title="Support Orbit" class="rise [--i:6] md:col-span-2 lg:col-span-12">
      <SponsorCard />
    </ToolPanel>
  </div>
</div>
