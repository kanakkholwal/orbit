<script lang="ts">
  import { Button, type ButtonSize, type ButtonVariant } from "$components/ui/button";
  import { canInstallNatively, needsManualInstall, promptInstall, pwa } from "$lib/pwa.svelte";
  import { IconArrowUpRight as ArrowUpRight, IconDownload as Download, IconDeviceMobile as Smartphone } from "@tabler/icons-svelte";
  import { toast } from "svelte-sonner";

  type Props = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    class?: string;
    /** When true, hide the button entirely if already installed. Default: show "Open app". */
    hideWhenInstalled?: boolean;
    /** When the platform needs manual instructions, link here instead of /install-pwa. */
    instructionsHref?: string;
  };

  let {
    variant = "default",
    size = "lg",
    class: className = "",
    hideWhenInstalled = false,
    instructionsHref = "/install-pwa",
  }: Props = $props();

  async function onInstall() {
    const result = await promptInstall();
    if (result === 'accepted') {
      toast.success('Orbit PDF installed');
    } else if (result === 'dismissed') {
      toast('Install cancelled');
    }
  }
</script>

{#if !pwa.ready}
  <!-- pre-hydration: render nothing to avoid flicker -->
{:else if pwa.installed}
  {#if !hideWhenInstalled}
    <Button {variant} {size} class={className} href="/?source=pwa-open">
      <ArrowUpRight />
      Open app
    </Button>
  {/if}
{:else if canInstallNatively()}
  <Button {variant} {size} class={className} onclick={onInstall}>
    <Download />
    Install app
  </Button>
{:else if needsManualInstall()}
  <Button {variant} {size} class={className} href={instructionsHref}>
    <Smartphone />
    Install app
  </Button>
{:else}
  <Button {variant} {size} class={className} href={instructionsHref}>
    <Download />
    Install app
  </Button>
{/if}
