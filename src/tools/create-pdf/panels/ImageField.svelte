<script lang="ts">
  import { Button } from "$components/ui/button";
  import { IconPhotoUp as Upload, IconTrash as Trash } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  type Props = { value: string; label: string; onchange: (value: string) => void };

  let { value, label, onchange }: Props = $props();

  let input = $state<HTMLInputElement | null>(null);

  /** Downscales large photos so drafts stay small; PNGs keep transparency. */
  async function toDataUrl(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const png = file.type === "image/png" || file.type === "image/svg+xml";
    return canvas.toDataURL(png ? "image/png" : "image/jpeg", 0.88);
  }

  async function pick(file: File | undefined) {
    if (!file) return;
    try {
      onchange(await toDataUrl(file));
    } catch {
      toast.error("That image couldn't be read. Try a JPG or PNG.");
    }
  }
</script>

<input
  bind:this={input}
  type="file"
  accept="image/png,image/jpeg,image/webp,image/svg+xml"
  class="hidden"
  onchange={(e) => {
    pick(e.currentTarget.files?.[0]);
    e.currentTarget.value = "";
  }}
/>

{#if value}
  <div class="flex items-center gap-3 rounded-xl border border-border p-2">
    <img src={value} alt="" class="size-14 shrink-0 rounded-lg border border-border bg-[repeating-conic-gradient(#f5f5f5_0_25%,#fff_0_50%)] bg-size-[12px_12px] object-contain" />
    <div class="flex min-w-0 flex-1 flex-wrap gap-2">
      <Button variant="outline" size="sm" onclick={() => input?.click()}>Replace</Button>
      <Button variant="ghost" size="icon-sm" aria-label={`Remove ${label.toLowerCase()}`} onclick={() => onchange("")}>
        <Trash />
      </Button>
    </div>
  </div>
{:else}
  <button
    type="button"
    onclick={() => input?.click()}
    class="flex h-20 w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-body text-muted-foreground outline-none transition-colors hover:border-primary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Upload class="size-5" />
    Choose {label.toLowerCase()}
  </button>
{/if}
