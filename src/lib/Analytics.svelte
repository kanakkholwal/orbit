<script>
  import { config } from "$constants/app";

  const GA_MEASUREMENT_ID = config.googleAnalyticsId;
</script>

<svelte:head>
  {#if GA_MEASUREMENT_ID}
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
    ></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag("js", new Date());
      gtag("config", GA_MEASUREMENT_ID); // Can also be configured here
    </script>
  {/if}
</svelte:head>
