<script lang="ts">
  import { page } from "$app/state";
  import Seo from "$components/Seo.svelte";
  import { ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "$components/ui/empty";
  import FileSuggestions from "$components/workspace/FileSuggestions.svelte";
  import { onMount } from "svelte";

  type LaunchParams = { files: { getFile(): Promise<File> }[] };
  type LaunchQueue = { setConsumer(consumer: (params: LaunchParams) => void): void };

  let files = $state<File[]>([]);
  let loaded = $state(false);

  /** Files shared from another app are parked in the cache by the service worker. */
  async function takeShared(): Promise<File[]> {
    if (!("caches" in window)) return [];
    const cache = await caches.open("orbit-shared");
    const requests = await cache.keys();
    const out: File[] = [];
    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;
      const name = decodeURIComponent(response.headers.get("x-name") ?? "shared-file");
      out.push(new File([await response.blob()], name, { type: response.headers.get("content-type") ?? "" }));
    }
    await Promise.all(requests.map((r) => cache.delete(r)));
    return out;
  }

  onMount(() => {
    // Files opened from the OS with "Open with Orbit" arrive through the launch queue.
    (window as Window & { launchQueue?: LaunchQueue }).launchQueue?.setConsumer(async (params) => {
      const opened = await Promise.all(params.files.map((handle) => handle.getFile()));
      files = [...files, ...opened];
      loaded = true;
    });

    if (page.url.searchParams.has("shared")) {
      void takeShared().then((shared) => {
        files = [...files, ...shared];
        loaded = true;
      });
    } else {
      // Nothing to wait for outside an install: show the empty state once the launch queue had its chance.
      setTimeout(() => (loaded = true), 400);
    }
  });
</script>

<Seo title="Open files" description="Choose a tool for the files you opened or shared with Orbit." noindex />

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-24 pt-8 md:px-6">
  <header class="rise flex flex-col gap-1">
    <h1 class="text-2xl font-medium text-foreground">Open files</h1>
    <p class="text-sm text-muted-foreground">Files you open or share with Orbit stay on this device.</p>
  </header>

  {#if files.length > 0}
    <ToolPanel class="rise [--i:1]">
      <FileSuggestions {files} heading="Choose a tool" onclear={() => (files = [])} />
    </ToolPanel>
  {:else if loaded}
    <Empty class="rise [--i:1]">
      <EmptyHeader>
        <EmptyTitle>No files yet</EmptyTitle>
        <EmptyDescription>
          Share a photo, video or PDF to Orbit from another app, or pick a tool to start.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button href="/explore">Browse tools</Button>
      </EmptyContent>
    </Empty>
  {/if}
</div>
