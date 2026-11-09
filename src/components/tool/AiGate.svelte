<script lang="ts">
  import { Badge } from "$components/ui/badge";
  import { Switch } from "$components/ui/switch";
  import { aiFlagEnabled, setAiFlag, type AiAvailability } from "$lib/chrome-ai";
  import { IconAlertTriangle as Warning } from "$lib/icons";
  import { appState } from "$stores/app-state.svelte";
  import { onMount, type Snippet } from "svelte";

  type Props = {
    /** Name shown in the messages, e.g. "Summarizer". */
    api: string;
    availability: () => Promise<AiAvailability>;
    children: Snippet;
  };

  let { api, availability, children }: Props = $props();

  let enabled = $state(false);
  let status = $state<AiAvailability | "checking">("checking");

  async function refresh() {
    status = "checking";
    status = await availability();
  }

  onMount(() => {
    enabled = aiFlagEnabled();
    if (enabled) refresh();
  });

  function toggle(next: boolean) {
    enabled = next;
    setAiFlag(next);
    if (next) refresh();
  }

  const reason = $derived(
    appState.isTauri
      ? "The desktop app does not include Chrome's built-in AI."
      : "Use Chrome on a desktop computer with enough free disk space. Firefox and Safari do not have these APIs."
  );
</script>

<div class="flex flex-col gap-4">
  <div class="rounded-2xl border border-border bg-background p-1">
    <div class="flex flex-col gap-3 rounded-[11px] bg-card p-4">
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-medium text-foreground">Experimental AI</h2>
            <Badge variant="warning">Experimental</Badge>
          </div>
          <p class="text-sm text-muted-foreground">
            This tool uses the AI model built into Chrome. Orbit does not download or run a model of its own, and your
            text stays on this device.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={toggle} aria-label="Enable experimental AI tools" />
      </div>
      <p class="flex items-start gap-2 text-xs text-muted-foreground">
        <Warning class="mt-0.5 size-3.5 shrink-0 text-warning-strong" />
        Results can be wrong or incomplete. Check them against the original. Chrome may download its own model the first
        time you use this, which can be large.
      </p>
    </div>
  </div>

  {#if !enabled}
    <p class="text-sm text-muted-foreground">Turn on experimental AI to use this tool.</p>
  {:else if status === "checking"}
    <p class="text-sm text-muted-foreground">Checking whether this browser supports {api}…</p>
  {:else if status === "unsupported" || status === "unavailable"}
    <div class="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground" role="status">
      <p class="font-medium text-foreground">{api} is not available here.</p>
      <p class="mt-1">{reason}</p>
    </div>
  {:else}
    {#if status === "downloadable" || status === "downloading"}
      <p class="text-sm text-muted-foreground">
        Chrome will {status === "downloading" ? "finish downloading" : "download"} its on-device model when you start. Keep this tab open.
      </p>
    {/if}
    {@render children()}
  {/if}
</div>
