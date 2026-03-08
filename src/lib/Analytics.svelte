<script lang="ts">
  import { browser } from '$app/environment';
  import { config } from '$constants/app';
  import { onMount } from 'svelte';
  
  let { googleAnalyticsId }  = config

  onMount(() => {
    if (!browser || !googleAnalyticsId) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      // @ts-ignore
      window.dataLayer.push(arguments);
    }
    // @ts-ignore
    gtag("js", new Date());

    // @ts-ignore
    gtag("config", googleAnalyticsId);
  });
</script>

<svelte:head>
  {#if googleAnalyticsId && browser}
    <script async src="https://www.googletagmanager.com/gtag/js?id={googleAnalyticsId}"></script>
  {/if}
</svelte:head>

