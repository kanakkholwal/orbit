<script lang="ts">
  import {
    CtaBanner,
    CtaBannerActions,
    CtaBannerContent,
    CtaBannerDescription,
    CtaBannerGrain,
    CtaBannerTitle,
  } from "$components/blocks/cta-banner";
  import type { Snippet } from "svelte";

  type Props = {
    title: string;
    body?: string;
    actions?: Snippet;
    class?: string;
  };

  let { title, body, actions, class: className }: Props = $props();
</script>

<CtaBanner variant="grain" class={className}>
  <CtaBannerGrain />
  <CtaBannerContent class="py-16 sm:py-20">
    <CtaBannerTitle class="text-3xl sm:text-4xl md:text-5xl">{title}</CtaBannerTitle>
    {#if body}
      <CtaBannerDescription>{body}</CtaBannerDescription>
    {/if}
    {#if actions}
      <CtaBannerActions>{@render actions()}</CtaBannerActions>
    {/if}
  </CtaBannerContent>
</CtaBanner>
