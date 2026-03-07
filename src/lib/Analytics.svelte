<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { config } from '$constants/app';
  import { onMount } from 'svelte';

  const GA_ID = config.googleAnalyticsId;

  onMount(() => {
    if (!browser || !GA_ID) return;

    // Inject the gtag script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialise the data layer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { send_page_view: false });
  });

  // Track page navigation as virtual page views
  $effect(() => {
    if (!browser || !GA_ID || typeof window.gtag !== 'function') return;
    const url = $page.url.pathname + $page.url.search;
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: document.title,
    });
  });
</script>
