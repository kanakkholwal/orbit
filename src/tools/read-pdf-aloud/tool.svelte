<script lang="ts">
  import { FileRow, OptionGroup, ProgressLine, ResultCard, ToolFooter } from "$components/tool";
  import { Button } from "$components/ui/button";
  import * as Select from "$components/ui/select";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import WorkspaceInspector from "$components/workspace/WorkspaceInspector.svelte";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";
  import { formatBytes } from "$utils/helper";
  import {
    IconAlertCircle as AlertCircle,
    IconLoader2 as Loader,
    IconPlayerPause as Pause,
    IconPlayerPlay as Play,
    IconPlayerStop as Stop,
    IconPlayerTrackNext as Next,
    IconPlayerTrackPrev as Prev,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";
  import { ReadAloudState } from "./helper.svelte";

  const store = new ReadAloudState();
  const uid = $props.id();

  let reader = $state<HTMLElement | null>(null);
  let startPage = $state(1);

  const field =
    "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-body tabular-nums text-foreground outline-none transition-colors placeholder:text-placeholder focus:border-ring";

  const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`;
  const voiceLabel = (v: SpeechSynthesisVoice) => `${v.name}${v.localService ? "" : " (Online)"}`;

  const lang = typeof navigator !== "undefined" ? navigator.language.split("-")[0].toLowerCase() : "en";
  const ownVoices = $derived(store.voices.filter((v) => v.lang.toLowerCase().startsWith(lang)));
  const otherVoices = $derived(store.voices.filter((v) => !v.lang.toLowerCase().startsWith(lang)));
  const pageCount = $derived(store.pages.length);
  const hasText = $derived(store.sentences.length > 0);
  const current = $derived(store.sentences[store.index]);
  const active = $derived(store.status === "playing" || store.status === "paused");
  const playLabel = $derived(
    store.status === "playing" ? "Pause" : store.status === "paused" ? "Resume" : store.status === "finished" ? "Read again" : "Read aloud"
  );

  $effect(() => () => store.destroy());

  $effect(() => {
    if (store.status !== "playing" || !reader) return;
    const el = reader.querySelector<HTMLElement>(`[data-sentence="${store.index}"]`);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 96 || rect.bottom > window.innerHeight - 160) {
      el.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  });

  function pickSentence(event: MouseEvent) {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-sentence]");
    if (!target || window.getSelection()?.toString()) return;
    const index = Number(target.dataset.sentence);
    if (store.status === "playing") store.jumpTo(index);
    else {
      store.index = index;
      store.play();
    }
  }
</script>

{#if !store.supported}
  <section class="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center">
    <span class="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
      <AlertCircle class="size-7" stroke={1.75} />
    </span>
    <h2 class="text-heading-sm font-medium text-foreground">This browser can't read aloud</h2>
    <p class="text-pretty text-body text-muted-foreground">
      Reading aloud uses the speech voices built into your browser, and this one doesn't offer any. Try a recent
      version of Chrome, Edge, Safari or Firefox.
    </p>
  </section>
{:else if !store.file}
  <UploadArea accept=".pdf,application/pdf" multiple={false} onFilesSelected={(files) => store.loadFile(files)}>
    {#snippet title()}
      <h3 class="text-heading-sm font-medium text-foreground">Drop a PDF to hear it read aloud</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-body text-muted-foreground">
        Listen to any document with a voice from your device, and follow along as each sentence is highlighted.
      </p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    {#if store.status === "finished"}
      <ResultCard title="Finished reading" description={`Read all ${plural(pageCount, "page")} of ${store.file.name}.`}>
        {#snippet actions()}
          <Button variant="outline" onclick={() => store.play()}>
            <Play />
            Read again
          </Button>
          <Button variant="ghost" onclick={() => store.reset()}>
            <Refresh />
            Start over
          </Button>
        {/snippet}
      </ResultCard>
    {/if}

    <FileRow
      name={store.file.name}
      meta={store.loaded ? `${formatBytes(store.file.size)} · ${plural(pageCount, "page")}` : formatBytes(store.file.size)}
      onRemove={store.isProcessing ? undefined : () => store.reset()}
    />

    {#if store.isProcessing}
      <div class="flex flex-col items-center gap-2 py-16 text-muted-foreground">
        <Loader class="size-5 animate-spin text-primary" />
        <p class="text-body">Getting the text ready</p>
      </div>
    {:else if store.loaded && !hasText}
      <section class="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 sm:p-5" aria-live="polite">
        <h2 class="text-body-lg font-medium text-foreground">No text to read</h2>
        <p class="text-body text-muted-foreground">
          This PDF looks like a scan or a set of images, so there are no words to read. Run
          <a href="/tools/ocr-pdf" class="font-medium text-primary underline-offset-4 hover:underline">OCR PDF</a>
          on it first, then open the result here.
        </p>
      </section>
    {:else if store.loaded}
      <p class="text-body text-muted-foreground">Click any sentence to start reading from there.</p>

      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
      <article bind:this={reader} onclick={pickSentence} class="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-8">
        {#each store.pages as page (page.number)}
          <section aria-label={`Page ${page.number}`} class="flex flex-col gap-4">
            <h2 class="text-caption font-medium uppercase tracking-wide text-muted-foreground">Page {page.number}</h2>
            {#if page.paragraphs.length === 0}
              <p class="text-body text-muted-foreground">No text on this page.</p>
            {/if}
            {#each page.paragraphs as paragraph (paragraph.index)}
              <p
                class={cn(
                  "border-l-2 pl-3 text-body-lg leading-relaxed text-foreground transition-colors duration-200",
                  active && current?.paragraph === paragraph.index ? "border-primary" : "border-transparent"
                )}
              >
                {#each paragraph.sentences as sentence (sentence.index)}
                  <span
                    data-sentence={sentence.index}
                    class={cn(
                      "cursor-pointer rounded-sm box-decoration-clone transition-colors duration-150 hover:bg-muted",
                      active && store.index === sentence.index && "bg-primary/15 hover:bg-primary/15"
                    )}
                    aria-current={active && store.index === sentence.index ? "true" : undefined}>{sentence.text}</span
                  >{" "}
                {/each}
              </p>
            {/each}
          </section>
        {/each}
      </article>
    {/if}
  </div>

  <WorkspaceInspector title="Listening">
    <div class="flex flex-col gap-6">
      <OptionGroup
        label="Voice"
        description="Voices come from your device and browser, so the list differs between computers."
      >
        {#if store.voices.length === 0}
          <p class="rounded-xl border border-border px-3 py-2.5 text-body text-muted-foreground">
            No voices found yet. If none appear, add a speech voice in your system settings.
          </p>
        {:else}
          <Select.Root type="single" value={store.voiceURI} onValueChange={(v) => store.setVoice(v)}>
            <Select.Trigger class="w-full" aria-label="Voice">
              <span class="truncate">{store.voice ? voiceLabel(store.voice) : "Choose a voice"}</span>
            </Select.Trigger>
            <Select.Content class="max-h-80">
              {#if ownVoices.length > 0}
                <Select.Group>
                  <Select.GroupHeading>Your language</Select.GroupHeading>
                  {#each ownVoices as voice (voice.voiceURI)}
                    <Select.Item value={voice.voiceURI} label={voiceLabel(voice)} />
                  {/each}
                </Select.Group>
              {/if}
              {#if otherVoices.length > 0}
                <Select.Group>
                  <Select.GroupHeading>Other languages</Select.GroupHeading>
                  {#each otherVoices as voice (voice.voiceURI)}
                    <Select.Item value={voice.voiceURI} label={`${voiceLabel(voice)} · ${voice.lang}`} />
                  {/each}
                </Select.Group>
              {/if}
            </Select.Content>
          </Select.Root>
          {#if store.voice && !store.voice.localService}
            <p class="text-caption text-muted-foreground">
              Online voices are run by your browser's maker, which may receive the text to speak it. Pick a voice without
              "Online" to keep everything on this device.
            </p>
          {/if}
        {/if}
      </OptionGroup>

      <OptionGroup label="Speed">
        <div class="flex items-center gap-3">
          <label for="{uid}-rate" class="sr-only">Reading speed</label>
          <input
            id="{uid}-rate"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            bind:value={store.rate}
            onchange={(e) => store.setRate(Number(e.currentTarget.value))}
            class="h-10 w-full cursor-pointer accent-primary"
          />
          <span class="w-12 shrink-0 text-right text-body tabular-nums text-foreground">{store.rate.toFixed(1)}×</span>
        </div>
      </OptionGroup>

      <OptionGroup label="Start from page" description={pageCount > 0 ? `This PDF has ${plural(pageCount, "page")}.` : undefined}>
        <form
          class="flex gap-2"
          onsubmit={(e) => {
            e.preventDefault();
            store.startFromPage(Math.max(1, Math.min(pageCount, Math.round(Number(startPage)) || 1)));
          }}
        >
          <label for="{uid}-page" class="sr-only">Page number</label>
          <input id="{uid}-page" type="number" min="1" max={Math.max(1, pageCount)} bind:value={startPage} class={field} disabled={!hasText} />
          <Button type="submit" variant="outline" disabled={!hasText}>Read</Button>
        </form>
      </OptionGroup>

      <OptionGroup label="About the audio">
        <p class="text-body text-muted-foreground">
          The voice plays live from your browser, so it can't be saved as an audio file. The PDF itself never leaves
          this device.
        </p>
      </OptionGroup>
    </div>
  </WorkspaceInspector>

  <ToolFooter>
    {#snippet hint()}
      {#if store.isProcessing}
        <ProgressLine label={store.progress.text} current={store.progress.current} total={store.progress.total} class="max-w-md" />
      {:else if !hasText}
        <span class="block truncate">{store.loaded ? "Nothing to read" : ""}</span>
      {:else if active && current}
        <span class="block truncate tabular-nums">
          {store.status === "paused" ? "Paused on" : "Reading"} page {current.page} of {pageCount} · sentence {store.index + 1} of {store.sentences.length}
        </span>
      {:else if store.status === "finished"}
        <span class="block truncate">Reached the end</span>
      {:else}
        <span class="block truncate tabular-nums">{plural(store.sentences.length, "sentence")} on {plural(pageCount, "page")}</span>
      {/if}
    {/snippet}

    <Button variant="outline" size="icon" aria-label="Previous sentence" disabled={!hasText || store.index === 0} onclick={() => store.jumpTo(store.index - 1)}>
      <Prev />
    </Button>
    <Button variant="outline" size="icon" aria-label="Stop" disabled={!active} onclick={() => store.stop()}>
      <Stop />
    </Button>
    <Button
      variant="outline"
      size="icon"
      aria-label="Next sentence"
      disabled={!hasText || store.index >= store.sentences.length - 1}
      onclick={() => store.jumpTo(store.index + 1)}
    >
      <Next />
    </Button>
    <Button variant="primary" class="min-w-32" disabled={!hasText} aria-keyshortcuts="Space" onclick={() => store.toggle()}>
      {#if store.status === "playing"}<Pause />{:else}<Play />{/if}
      {playLabel}
    </Button>
  </ToolFooter>
{/if}

<svelte:window
  onkeydown={(e) => {
    if (e.key !== " " || !hasText || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select, button, a, [role=\"option\"], [contenteditable]")) return;
    e.preventDefault();
    store.toggle();
  }}
/>
