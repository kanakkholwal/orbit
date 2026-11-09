<script lang="ts">
  import { page } from "$app/state";
  import { Button, type ButtonProps } from "$components/ui/button";
  import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "$components/ui/input-group";
  import ResponsiveDialog from "$components/ui/ResponsiveDialog.svelte";
  import { useShare } from "$lib/hooks/use-share.svelte";
  import { cn } from "$lib/utils";
  import { IconCheck as Check, IconCopy as Copy, IconShare as Share2 } from "$lib/icons";
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
  >
    <div class="flex flex-col gap-5">
      <p class="text-sm text-muted-foreground">Anyone with the link can open this page.</p>

      <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {#each socials as social (social.name)}
          <li>
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background px-2 py-3 outline-none transition-[border-color,transform] duration-(--duration-base) ease-(--ease-ui-out) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-row)"
            >
              <social.icon class="size-5 text-foreground transition-colors group-hover:text-primary" />
              <span class="text-xs capitalize text-muted-foreground transition-colors group-hover:text-foreground">
                {social.name}
              </span>
              <span class="sr-only">Share on {social.name}</span>
            </a>
          </li>
        {/each}
        {#if isNativeShareSupported}
          <li>
            <button
              type="button"
              onclick={() => share()}
              class="group flex w-full flex-col items-center gap-2 rounded-xl border border-border bg-background px-2 py-3 outline-none transition-[border-color,transform] duration-(--duration-base) ease-(--ease-ui-out) hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring active:scale-(--press-scale-row)"
            >
              <Share2 class="size-5 text-primary" />
              <span class="text-xs text-muted-foreground group-hover:text-foreground">More</span>
              <span class="sr-only">Share with another app</span>
            </button>
          </li>
        {/if}
      </ul>

      <InputGroup>
        <InputGroupInput readonly value={shareUrl} aria-label="Link" onfocus={(e) => e.currentTarget.select()} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton onclick={handleCopy} aria-label="Copy link">
            {#if copied}
              <Check />
              Copied
            {:else}
              <Copy />
              Copy
            {/if}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  </ResponsiveDialog>
{/if}

{#snippet shareTitle()}
  <span class="text-base font-medium text-foreground">
    {data.title ? `Share ${data.title}` : "Share this page"}
  </span>
{/snippet}

{#snippet defaultTriggerLabel()}
  Share
{/snippet}
