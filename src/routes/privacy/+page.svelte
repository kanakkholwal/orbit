<script lang="ts">
  import LegalPage from "$components/common/LegalPage.svelte";
  import Seo from "$components/Seo.svelte";
  import { config } from "$constants/app";

  const sections = [
    {
      heading: "1. Our privacy-first architecture",
      paragraphs: [
        `${config.appName} is built so that your documents never leave your device. Every PDF, image, or file you open is processed entirely within your own browser (or the desktop app) using WebAssembly engines. We do not upload, transmit, receive, store, or have any access to the contents of your files. There is no server that sees your documents, because no document is ever sent to one.`,
        `This is not a policy promise alone — it is how the software is engineered. The project is open source under GPL-3.0, so the privacy claims are independently verifiable.`,
      ],
    },
    {
      heading: "2. Information we do not collect",
      list: [
        "The contents of any file you process — these never leave your device.",
        "Account information — there are no accounts, logins, or sign-ups.",
        "Names, addresses, or payment details — the service is free and requires none of these.",
      ],
    },
    {
      heading: "3. Information that may be collected automatically",
      paragraphs: [
        "When you use the web version of the site, limited technical and usage information may be collected by third-party services to keep the site running and to support it through advertising:",
      ],
      list: [
        "Standard log and analytics data such as browser type, device type, approximate region, referring page, and which pages you visit. This is aggregated and anonymous, and is used to understand general usage and improve the product.",
        "Cookies and similar identifiers set by analytics and advertising providers (see sections 4 and 5).",
        "Local storage values saved on your own device — such as your theme preference and your list of recently used tools. These stay on your device and are not transmitted to us.",
      ],
    },
    {
      heading: "4. Cookies",
      paragraphs: [
        "A cookie is a small file placed on your device. We use cookies and similar technologies only to operate the site, remember your preferences, measure usage, and serve advertising on the web version.",
        "You can set your browser to refuse some or all cookies, or to alert you when sites set them. If you disable cookies, the core tools will still function, since they run locally, but some features and advertising behaviour may change.",
      ],
    },
    {
      heading: "5. Advertising and Google AdSense",
      paragraphs: [
        "The web version of the site may display advertising served by Google AdSense and other third-party vendors.",
        "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to this site and/or other sites on the internet.",
        "You may opt out of personalised advertising by visiting Google's Ads Settings (https://www.google.com/settings/ads). You can also opt out of some third-party vendors' use of cookies for personalised advertising by visiting https://www.aboutads.info/choices.",
      ],
    },
    {
      heading: "6. Analytics",
      paragraphs: [
        "The web version may use Google Analytics to understand aggregate, anonymous usage patterns — for example which tools are most used — so we can prioritise improvements. Google Analytics may set cookies and process data in accordance with Google's own privacy policy (https://policies.google.com/privacy).",
      ],
    },
    {
      heading: "7. Third-party services",
      paragraphs: [
        "The services that may process limited, non-file data on the web version are operated by Google (AdSense and Analytics). Their handling of data is governed by their own policies, which we encourage you to review at https://policies.google.com/technologies/partner-sites.",
      ],
    },
    {
      heading: "8. Data security",
      paragraphs: [
        "Because your files are processed locally and never transmitted, they are as secure as the device you use. We hold no copies of your documents and therefore cannot lose, leak, or be compelled to disclose them.",
      ],
    },
    {
      heading: "9. Children's privacy",
      paragraphs: [
        "The site is not directed at children under 13, and we do not knowingly collect personal information from children. Since the tools collect no personal information at all, this concern is minimal, but parents and guardians should supervise children's internet use.",
      ],
    },
    {
      heading: "10. Your rights",
      paragraphs: [
        "Depending on your location, you may have rights under regulations such as the GDPR or CCPA, including the right to access, correct, or delete personal data held about you. Because we do not collect or store personal data or file contents, there is generally nothing for us to access or delete. Any anonymous analytics and advertising data is handled by the respective third parties under their policies.",
      ],
    },
    {
      heading: "11. Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date at the top of this page. Continued use of the site after changes constitutes acceptance of the revised policy.",
      ],
    },
    {
      heading: "12. Contact us",
      paragraphs: [
        `If you have any questions about this Privacy Policy or our practices, contact us at ${config.supportEmail}.`,
      ],
    },
  ];
</script>

<Seo
  title={`Privacy Policy — ${config.appName}`}
  description={`How ${config.appName} handles your data. Your files are processed entirely on your device and never uploaded. Learn about cookies, analytics, and advertising on the web version.`}
  keywords={["privacy policy", "orbit pdf privacy", "data protection", "client-side processing"]}
/>

<LegalPage
  eyebrow="Legal"
  title="Privacy Policy"
  intro={`Your privacy is the foundation of ${config.appName}, not an afterthought. This policy explains exactly what is — and is not — collected when you use the tools and the website.`}
  updated="June 7, 2026"
  {sections}
/>
