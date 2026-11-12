<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import SponsorCard from "$components/common/SponsorCard.svelte";
  import { OptionGroup, OptionToggle, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { clearRecentTools } from "$lib/runtime/recent-tools.svelte";
  import { settings } from "$lib/settings/settings.svelte";
  import { formatBytes, offlineStorage } from "$lib/settings/storage.svelte";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";

  const formatKinds = [
    { key: "image", label: "Images", options: ["webp", "jpg", "png", "avif"] },
    { key: "audio", label: "Audio", options: ["mp3", "wav", "ogg", "flac"] },
    { key: "video", label: "Video", options: ["mp4", "webm", "gif"] },
    { key: "document", label: "Documents", options: ["docx", "md", "html", "txt"] },
  ] as const;

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

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-20 pt-8 md:px-6">
  <header class="rise flex flex-col gap-1">
    <h1 class="text-2xl font-medium text-foreground">Settings</h1>
    <p class="text-sm text-muted-foreground">Saved on this device only. Nothing here is sent anywhere.</p>
  </header>

  <ToolPanel
    title="Conversion"
    description="Applies to image, audio, video and document tools."
    class="rise [--i:1]"
    contentClass="flex flex-col gap-6"
  >
    <OptionGroup label="Output file name" description="Use %name% for the original name.">
      <Input bind:value={settings.value.filenameTemplate} placeholder="%name%" class="min-h-11" autocomplete="off" />
      <p class="text-xs tabular-nums text-muted-foreground">Example: {preview}</p>
    </OptionGroup>

    {#each formatKinds as kind (kind.key)}
      <OptionGroup label={`Default ${kind.label.toLowerCase()} format`}>
        <div class="flex flex-wrap gap-2" role="radiogroup" aria-label={kind.label}>
          {#each kind.options as option (option)}
            <Button
              type="button"
              role="radio"
              aria-checked={settings.value.defaultFormats[kind.key] === option}
              variant={settings.value.defaultFormats[kind.key] === option ? "default" : "outline"}
              class="min-h-11 min-w-14 uppercase"
              onclick={() => (settings.value.defaultFormats[kind.key] = option)}
            >
              {option}
            </Button>
          {/each}
        </div>
      </OptionGroup>
    {/each}

    <OptionGroup
      label={`Image quality: ${settings.value.imageQuality}`}
      description="Lower is smaller. 80 to 90 looks the same for most photos."
    >
      <input
        type="range"
        min="40"
        max="100"
        step="1"
        bind:value={settings.value.imageQuality}
        aria-label="Image quality"
        class="h-11 w-full accent-primary"
      />
    </OptionGroup>
  </ToolPanel>

  <ToolPanel
    title="Offline"
    description="Engines download once, then work without internet."
    class="rise [--i:2]"
    contentClass="flex flex-col gap-4"
  >
    {#if offlineStorage.supported}
      <div class="flex flex-col gap-2">
        <div class="h-1.5 overflow-hidden rounded-full bg-muted" role="presentation">
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-(--duration-base)"
            style="width: {usagePct}%"
          ></div>
        </div>
        <p class="text-xs tabular-nums text-muted-foreground">
          {formatBytes(offlineStorage.usage)} used of {formatBytes(offlineStorage.quota)}
          {offlineStorage.persisted ? "· protected from eviction" : ""}
        </p>
      </div>
    {:else}
      <p class="text-sm text-muted-foreground">This browser does not report storage use.</p>
    {/if}
    <div class="flex flex-wrap gap-2">
      {#if offlineStorage.supported && !offlineStorage.persisted}
        <Button variant="outline" class="min-h-11" onclick={persist}>Keep offline data</Button>
      {/if}
      <Button variant="outline" class="min-h-11" onclick={clearOffline}>Clear offline engines</Button>
    </div>
    <OptionToggle
      label="Ask before large downloads"
      description="Warns before fetching engines over 20 MB, useful on mobile data."
      bind:checked={settings.value.confirmLargeDownloads}
    />
  </ToolPanel>

  <ToolPanel title="Privacy" class="rise [--i:3]" contentClass="flex flex-col gap-4">
    <OptionToggle
      label="Anonymous usage stats"
      description="Page views and tool names only. File names and contents never leave your device."
      bind:checked={settings.value.analytics}
    />
    <div>
      <Button variant="outline" class="min-h-11" onclick={resetAll}>Reset settings and recent tools</Button>
    </div>
  </ToolPanel>

  <ToolPanel title="Support Orbit" class="rise [--i:4]">
    <SponsorCard />
  </ToolPanel>
</div>
