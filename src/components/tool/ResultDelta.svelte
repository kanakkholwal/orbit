<script lang="ts">
  import { Badge } from "$components/ui/badge";
  import { deltaTone } from "./delta";
  import { IconAlertTriangle as Alert, IconArrowDown as Down, IconArrowUp as Up, IconCheck as Check } from "$lib/icons";

  interface Props {
    before: number;
    after: number;
    /** Byte limit the result had to fit under. */
    limit?: number;
    class?: string;
  }

  let { before, after, limit, class: className = "" }: Props = $props();

  const tone = $derived(deltaTone(before, after, limit));
  const over = $derived(!!limit && after > limit);
  const pct = $derived(Math.abs(Math.round(((after - before) / before) * 100)));
</script>

<Badge variant={tone === "good" ? "success" : tone === "bad" ? "destructive" : "secondary"} class={className}>
  {#if over}
    <Alert class="size-3.5 shrink-0" />
    Over the limit
  {:else if tone === "good"}
    <Down class="size-3.5 shrink-0" />
    {pct}% smaller
  {:else if tone === "bad"}
    <Up class="size-3.5 shrink-0" />
    {pct}% larger
  {:else}
    <Check class="size-3.5 shrink-0" />
    Same size
  {/if}
</Badge>
