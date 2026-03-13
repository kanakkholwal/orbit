<script lang="ts">
  import { dev } from "$app/environment";
  import { page } from "$app/state";
  import { config, faqs } from "$constants/app";

  export let title = config.appName;
  export let description = config.appDescription;
  export let keywords: string[] = [];
  export let image = config.appDomain + "/og.png";
  export let imageAlt = config.appName;
  export let isBase = false;
  export let type: "website" | "article" = "website";

  // Article-specific (only used when type = "article")
  export let publishedTime: string | undefined = undefined;
  export let modifiedTime: string | undefined = undefined;
  export let author: string | undefined = undefined;

  const baseUrl = dev ? "http://localhost:3000" : `https://${config.appDomain}`;

  // Normalize pathname — avoid double slashes, strip trailing slash (except root)
  const pathname = page.url.pathname.replace(/\/$/, "") || "/";
  const canonicalUrl = `${baseUrl}${pathname}`;

  const fullTitle = isBase ? title : `${title} | ${config.appName}`;

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebSite",
    name: fullTitle,
    url: canonicalUrl,
    ...(image ? { image } : {}),
    ...(type === "article" && author
      ? { author: { "@type": "Person", name: author } }
      : {}),
    ...(type === "article" && publishedTime
      ? { datePublished: publishedTime }
      : {}),
    ...(type === "article" && modifiedTime
      ? { dateModified: modifiedTime }
      : {}),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if keywords.length > 0}
    <meta name="keywords" content={keywords.join(", ")} />
  {/if}
  <link rel="canonical" href={canonicalUrl} />
  <meta name="robots" content="index, follow" />

  <!-- Open Graph -->
  <meta property="og:site_name" content={config.appName} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content="en_US" />
  {#if image}
    <meta property="og:image" content={image} />
    <meta property="og:image:alt" content={imageAlt} />
  {/if}

  {#if type === "article"}
    {#if publishedTime}<meta
        property="article:published_time"
        content={publishedTime}
      />{/if}
    {#if modifiedTime}<meta
        property="article:modified_time"
        content={modifiedTime}
      />{/if}
    {#if author}<meta property="article:author" content={author} />{/if}
  {/if}

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={config.appDomain} />
  <meta name="twitter:url" content={canonicalUrl} />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {#if image}
    <meta name="twitter:image" content={image} />
    <meta name="twitter:image:alt" content={imageAlt} />
  {/if}

  <!-- Schema.org JSON-LD -->
  {@html `<script type="application/ld+json">${JSON.stringify(schemaOrg)}</script>`}
  {@html `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`}
</svelte:head>
