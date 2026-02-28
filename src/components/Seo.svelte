<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import { config } from "$constants/app";

  export let title = config.appName;
  export let description = config.appDescription;
  export let keywords:string[] = []
  export let image = config.appDomain + "/og.png";
  export let isBase = false;

  let canonicalUrl = dev
    ? `http://localhost:3000/${page.url.pathname.toString()}`
    : `https://${config.appDomain}${page.url.pathname.toString()}`;
</script>

<svelte:head>
  <title>{isBase ? title : `${title} | ${config.appName}`}</title>
  <meta name="description" content={description} />
  <meta property="og_site_name" content={config.appDomain} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="keywords" content={keywords.join(",")}/>
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="twitter:domain" content={config.appDomain} />
  <meta property="twitter:url" content={canonicalUrl} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />

  {@html `  <script type="application/ld+json">{
   "@context": "https://schema.org",
   "@type": "Website",
   "name": "${title} | ${config.appName}",
   "url": "${canonicalUrl}"",
   ${image ? `"logo": "${image}",` : ''}
  }</script>`}

  {#if image}
    <meta name="twitter:image" content={image} />
    <meta property="og:image" content={image} />
  {/if}
</svelte:head>
