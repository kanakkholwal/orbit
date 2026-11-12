<script lang="ts">
  import { FileRow, ToolBar } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { CopyButton } from "$components/ui/copy-button";
  import UploadArea from "$components/ui/UploadArea.svelte";
  import { IconFile as FileIcon, IconPlus as Plus } from "$lib/icons";
  import { formatBytes } from "$utils/helper";

  const ALGOS = ["SHA-256", "SHA-1", "SHA-512"] as const;
  type Row = { id: string; file: File; hashes?: Record<string, string>; error?: string };

  let rows = $state<Row[]>([]);
  let addInput = $state<HTMLInputElement | null>(null);
  const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

  async function add(files: File[]) {
    const fresh = files.map((file) => ({ id: crypto.randomUUID(), file }) as Row);
    rows.push(...fresh);
    for (const row of fresh) {
      const target = rows.find((r) => r.id === row.id)!;
      try {
        const data = await row.file.arrayBuffer();
        const out: Record<string, string> = {};
        for (const algo of ALGOS) out[algo] = hex(await crypto.subtle.digest(algo, data));
        target.hashes = out;
      } catch {
        target.error = "This file is too large to read in the browser.";
      }
    }
  }
</script>

{#if rows.length === 0}
  <UploadArea accept="*" onFilesSelected={(files) => void add(files)}>
    {#snippet title()}
      <h3 class="text-2xl font-medium text-foreground">Choose files to checksum</h3>
    {/snippet}
    {#snippet description()}
      <p class="max-w-sm text-pretty text-sm text-muted-foreground">SHA-256, SHA-1 and SHA-512 are calculated on your device. The files are never uploaded.</p>
    {/snippet}
  </UploadArea>
{:else}
  <div class="flex flex-col gap-4">
    <ToolBar label="Files" count={rows.length} onReset={() => (rows = [])} resetLabel="Clear all">
      {#snippet actions()}
        <Button variant="outline" size="sm" onclick={() => addInput?.click()}>
          <Plus />
          Add
        </Button>
      {/snippet}
    </ToolBar>
    <ul class="flex flex-col gap-3">
      {#each rows as row (row.id)}
        <li class="flex flex-col gap-2">
          <FileRow name={row.file.name} icon={FileIcon} tone={row.error ? "bad" : undefined} onRemove={() => (rows = rows.filter((r) => r.id !== row.id))}>
            <span>{formatBytes(row.file.size)}</span>
            {#if row.error}<span class="whitespace-normal text-destructive-strong">{row.error}</span>{:else if !row.hashes}<span>Calculating…</span>{/if}
          </FileRow>
          {#if row.hashes}
            <dl class="grid gap-2 rounded-xl border border-border bg-card p-3">
              {#each ALGOS as algo (algo)}
                <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <dt class="w-20 shrink-0 text-xs font-medium text-muted-foreground">{algo}</dt>
                  <dd class="min-w-0 flex-1 break-all font-mono text-xs text-foreground">{row.hashes[algo]}</dd>
                  <CopyButton text={row.hashes[algo]} iconOnly label={`Copy ${algo}`} />
                </div>
              {/each}
            </dl>
          {/if}
        </li>
      {/each}
    </ul>
    <input
      bind:this={addInput}
      type="file"
      multiple
      class="hidden"
      onchange={(e) => {
        const picked = Array.from(e.currentTarget.files ?? []);
        if (picked.length > 0) void add(picked);
        e.currentTarget.value = "";
      }}
    />
  </div>
{/if}
