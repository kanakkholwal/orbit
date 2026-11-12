<script lang="ts">
  import ClosingCta from "$components/landing/ClosingCta.svelte";
  import FeatureBento from "$components/landing/FeatureBento.svelte";
  import HeroSection from "$components/landing/HeroSection.svelte";
  import GuidesStrip from "$components/landing/GuidesStrip.svelte";
  import ProofStrip from "$components/landing/ProofStrip.svelte";
  import Steps from "$components/landing/Steps.svelte";
  import ToolFinder from "$components/landing/ToolFinder.svelte";
  import Seo from "$components/Seo.svelte";
  import { FaqList, RailFrame, RailRow, SectionHeader } from "$components/site";
  import { CollectionGrid } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconMail as Mail } from "$lib/icons";

  const faqs = [
    {
      q: "What can Orbit do?",
      a: "It handles PDFs, photos, video, audio and documents: merge, split, compress, resize, crop, convert, sign, extract and more. There are over 90 tools, plus ready-made presets for jobs such as passport photos and files under a size limit.",
    },
    {
      q: "Are my files uploaded anywhere?",
      a: "No. Every tool runs on your own device, in the browser or the desktop app. Your file is opened locally and saved straight back to it. It is never sent to a server.",
    },
    {
      q: "Can it fit a photo or PDF to a form's size limit?",
      a: "Yes. Choose a preset such as passport photo, signature or a size like 50 KB or 200 KB, or enter your own width, height and limit. Orbit lowers quality, then size, until the file fits.",
    },
    {
      q: "Is Orbit really free?",
      a: "Yes. There is no watermark, no account and no page or file count limit. Orbit is open source, so anyone can check how it works.",
    },
    {
      q: "Does it work offline?",
      a: "Yes. Install Orbit from your browser or get the desktop app. Tools that need a large engine, such as the document converter, download it once and then work with no internet.",
    },
    {
      q: "How large a file can it handle?",
      a: "There is no upload limit, because nothing is uploaded. Orbit reads your device's memory and cores and sets a safe size for video, audio and photos, and tells you if a file is too large for it.",
    },
    {
      q: "Why does my fan spin up?",
      a: "Because the work happens on your device instead of a faraway server. Heavy jobs like video conversion take some effort, and the page stays usable while they run.",
    },
  ];
</script>

<Seo
  title="Orbit: Free, Private Tools for PDFs, Photos, Video and Documents"
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
  <RailRow id="home" divider={false} label="Introduction" class="pt-12 pb-4 md:pt-16 md:pb-6">
    <HeroSection />
  </RailRow>

  <RailRow id="proof" label="At a glance" class="py-8 md:py-10">
    <ProofStrip />
  </RailRow>

  <RailRow id="tools" label="Find a tool" class="py-10 md:py-12">
    <ToolFinder />
  </RailRow>

  <RailRow id="jobs" label="Start with the job">
    <SectionHeader eyebrow="Popular jobs" title="Start with the job," accent="not the tool" class="mb-8" />
    <CollectionGrid />
  </RailRow>

  <RailRow id="features" label="Features">
    <FeatureBento />
  </RailRow>

  <RailRow id="how" label="How it works">
    <SectionHeader eyebrow="How it works" title="Three steps," accent="no upload" class="mb-8" />
    <Steps />
  </RailRow>

  <RailRow id="guides" label="Guides">
    <SectionHeader eyebrow="Guides" title="Practical guides" accent="for everyday files" class="mb-8">
      {#snippet action()}
        <Button href="/articles" variant="outline" size="sm">All guides</Button>
      {/snippet}
    </SectionHeader>
    <GuidesStrip />
  </RailRow>

  <RailRow id="faq" label="Frequently asked questions" class="">
    <div class="relative w-full">
      <div class="flex flex-col gap-10 lg:flex-row lg:gap-20">
        <div class="flex shrink-0 flex-col gap-2 lg:w-80">
          <h2 class="text-4xl font-medium text-foreground">
            Frequently asked <br />
            <span class="text-primary">questions</span>
          </h2>
          <p class="text-sm text-muted-foreground">
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