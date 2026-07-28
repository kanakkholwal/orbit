<script lang="ts">
  import { page } from "$app/state";
  import { Button, type ButtonProps } from "$components/ui/button";
  import ResponsiveDialog from "$components/ui/ResponsiveDialog.svelte";
  import { useShare } from "$lib/hooks/use-share.svelte";
  import { cn } from "$lib/utils";
  import { IconCheck as Check, IconCopy as Copy, IconShare as Share2 } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { toast } from "svelte-sonner";

  type Props = {
    data: {
      title?: string;
      text?: string;
      url?: string;
      image?: string;
    };
    shareCurrentUrl?: boolean;
    class?: string;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
    children?: Snippet;
  } & HTMLButtonAttributes;

  let {
    data,
    shareCurrentUrl = false,
    class: className,
    variant = "outline",
    size = "default",
    children,
    disabled,
  }: Props = $props();

  let shareUrl = $derived.by(() => {
    if (shareCurrentUrl && typeof window !== "undefined") {
      return window.location.href;
    }
    return data.url || page.url.href;
  });

  const { share, isNativeShareSupported, socials } = useShare(() => ({
    title: data.title,
    text: data.text,
    url: shareUrl,
    image: data.image,
  }));

  let copied = $state(false);

  function handleCopy() {
    if (!shareUrl) {
      toast.error("No URL provided to copy");
      return;
    }
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        copied = true;
        toast.success("Link copied");
        setTimeout(() => (copied = false), 2000);
      })
      .catch(() => toast.error("Failed to copy link"));
  }
</script>

{#if shareUrl}
  <ResponsiveDialog
    title={shareTitle}
    btnProps={{
      variant,
      size,
      class: className,
      children: children || defaultTriggerLabel,
      disabled,
    }}
    class="flex flex-col gap-6"
  >
    <div class="grid grid-cols-4 gap-3 sm:grid-cols-5">
      {#each socials as social}
        <a
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${social.name}`}
          class="group flex flex-col items-center gap-2 outline-none"
        >
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-muted text-foreground transition-all duration-200 ease-snappy group-hover:bg-primary/10 group-hover:text-primary group-active:scale-95"
          >
            <social.icon class="size-5" />
          </span>
          <span class="truncate text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
            {social.name}
          </span>
          <span class="sr-only">Share on {social.name}</span>
        </a>
      {/each}

      {#if isNativeShareSupported}
        <button
          type="button"
          onclick={() => share()}
          title="Share via system"
          class="group flex flex-col items-center gap-2 outline-none"
        >
          <span
            class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 ease-snappy group-hover:bg-primary/15 group-active:scale-95"
          >
            <Share2 class="size-5" />
          </span>
          <span class="text-[11px] text-muted-foreground transition-colors group-hover:text-foreground">
            More
          </span>
          <span class="sr-only">Native share</span>
        </button>
      {/if}
    </div>

    <div
      class={cn(
        "flex items-center gap-2 rounded-xl border py-1.5 pl-4 pr-1.5 transition-colors",
        copied ? "border-success/40 bg-success/5" : "border-border bg-muted/40"
      )}
    >
      <p class="flex-1 truncate text-sm text-muted-foreground" title={shareUrl}>
        {shareUrl}
      </p>
      <Button
        variant="secondary"
        size="sm"
        class={cn("shrink-0 rounded-lg", copied && "text-success")}
        onclick={handleCopy}
      >
        {#if copied}
          <Check class="size-3.5" />
          Copied
        {:else}
          <Copy class="size-3.5" />
          Copy
        {/if}
      </Button>
    </div>
  </ResponsiveDialog>
{/if}

{#snippet shareTitle()}
  <span class="text-base font-semibold tracking-tight text-foreground">
    {data.title ? `Share “${data.title}”` : "Share this page"}
  </span>
{/snippet}

{#snippet defaultTriggerLabel()}
  Share
{/snippet}
