<script lang="ts">
  import ClosingCta from "$components/landing/ClosingCta.svelte";
  import FeatureBento from "$components/landing/FeatureBento.svelte";
  import HeroSection from "$components/landing/HeroSection.svelte";
  import ToolFinder from "$components/landing/ToolFinder.svelte";
  import Seo from "$components/Seo.svelte";
  import { FaqList, RailFrame, RailRow } from "$components/site";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconMail as Mail } from "@tabler/icons-svelte";

  const faqs = [
    {
      q: "Are my files uploaded anywhere?",
      a: "No. Every tool works inside your browser, so your document is opened on your computer and saved straight back to it. It is never sent anywhere.",
    },
    {
      q: "Is Orbit really free?",
      a: "Yes. There is no watermark, no account and no page limit. Orbit is open source, so anyone can check how it works.",
    },
    {
      q: "How large a document can it handle?",
      a: "There is no upload limit. Hundred-page documents are routine; very large scanned files depend on how much memory your computer has.",
    },
    {
      q: "Does it work offline?",
      a: "Yes. Install Orbit from your browser or download the desktop app, and every tool keeps working with no internet at all.",
    },
    {
      q: "Which browsers are supported?",
      a: "Any up-to-date version of Chrome, Edge, Firefox or Safari.",
    },
    {
      q: "Why does my fan spin up?",
      a: "Because the work happens on your computer instead of a faraway server. Heavy jobs like compressing or reading scanned text take a little effort, and the page stays usable while they run.",
    },
  ];
</script>

<Seo
  title="Free PDF Tools: No Upload, No Watermark | Orbit PDF"
  description={config.appDescription}
  keywords={config.appKeywords}
  isBase={true}
  jsonLd={[
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: config.appName,
      url: `https://${config.appDomain}`,
      potentialAction: {
        "@type": "SearchAction",
        target: `https://${config.appDomain}/explore?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: config.appName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, Windows, macOS, Linux",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      url: `https://${config.appDomain}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ]}
/>

<RailFrame>
  <RailRow id="home" divider={false} label="Introduction" class="px-3 pt-32 pb-4 sm:px-6 sm:pt-36 sm:pb-6">
    <HeroSection />
  </RailRow>

  <RailRow id="tools" label="Find a tool" class="px-3 py-10 sm:px-6 sm:py-14">
    <ToolFinder />
  </RailRow>

  <RailRow id="features" label="Features">
    <FeatureBento />
  </RailRow>

  <RailRow id="faq" label="Frequently asked questions" class="justify-center lg:min-h-[calc(100svh-6.5rem)]">
    <div class="relative w-full overflow-hidden px-4 py-6 sm:px-10 sm:py-8 lg:px-16 lg:py-10">
      <div class="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div class="flex shrink-0 flex-col gap-2 lg:w-110">
          <h2 class="text-heading-lg font-medium text-foreground">
            Frequently asked <br />
            <span class="text-primary">questions</span>
          </h2>
          <p class="text-body text-muted-foreground">
            Can't find the answer you're looking for? <br /> We're here to help.
          </p>
          <Button href={`mailto:${config.supportEmail}`} class="mt-6 w-fit">
            Contact us
            <Mail />
          </Button>
        </div>

        <div class="w-full flex-1">
          <FaqList items={faqs} variant="cards" />
        </div>
      </div>
    </div>
  </RailRow>

  <RailRow label="Get started">
    <ClosingCta />
  </RailRow>
</RailFrame>