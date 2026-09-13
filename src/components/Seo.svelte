<script lang="ts">
  import { page } from "$app/state";
  import { config } from "$constants/app";

  type Props = {
    title?: string;
    description?: string;
    keywords?: string[];
    /** Absolute URL or a path on the canonical domain. */
    image?: string;
    imageAlt?: string;
    /** Uses the title as is, without the " | Orbit PDF" suffix. */
    isBase?: boolean;
    type?: "website" | "article";
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    noindex?: boolean;
    /** Extra JSON-LD objects for this page. */
    jsonLd?: Record<string, unknown>[];
  };

  let {
    title = config.appName,
    description = config.appDescription,
    keywords = [],
    image = "/og.png",
    imageAlt = config.appName,
    isBase = false,
    type = "website",
    publishedTime,
    modifiedTime,
    author,
    noindex = false,
    jsonLd = [],
  }: Props = $props();

  const origin = `https://${config.appDomain}`;
  const canonicalUrl = $derived(`${origin}${page.url.pathname.replace(/\/+$/, "") || "/"}`);
  const fullTitle = $derived(isBase ? title : `${title} | ${config.appName}`);
  const imageUrl = $derived(image.startsWith("http") ? image : `${origin}${image}`);

  const schemas = $derived([
    type === "article"
      ? {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          url: canonicalUrl,
          image: imageUrl,
          ...(publishedTime ? { datePublished: publishedTime } : {}),
          ...(modifiedTime || publishedTime ? { dateModified: modifiedTime ?? publishedTime } : {}),
          author: { "@type": author ? "Person" : "Organization", name: author ?? config.appName },
          publisher: { "@type": "Organization", name: config.appName, url: origin },
        }
      : { "@context": "https://schema.org", "@type": "WebPage", name: fullTitle, description, url: canonicalUrl },
    ...jsonLd,
  ]);

  const ldJson = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, "\\u003c")}</` + "script>";
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if keywords.length > 0}
    <meta name="keywords" content={keywords.join(", ")} />
  {/if}
  <link rel="canonical" href={canonicalUrl} />
  <meta name="robots" content={noindex ? "noindex, follow" : "index, follow, max-image-preview:large"} />

  <meta property="og:site_name" content={config.appName} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:alt" content={imageAlt} />
  {#if image === "/og.png"}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  {#if type === "article"}
    {#if publishedTime}<meta property="article:published_time" content={publishedTime} />{/if}
    {#if modifiedTime}<meta property="article:modified_time" content={modifiedTime} />{/if}
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />
  <meta name="twitter:image:alt" content={imageAlt} />

  {#each schemas as schema, i (i)}
    {@html ldJson(schema)}
  {/each}
</svelte:head>
