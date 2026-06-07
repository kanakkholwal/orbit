<script lang="ts">
  import LegalPage from "$components/common/LegalPage.svelte";
  import Seo from "$components/Seo.svelte";
  import { config } from "$constants/app";

  const sections = [
    {
      heading: "1. Acceptance of terms",
      paragraphs: [
        `By accessing or using ${config.appName} (the "Service"), whether via the website or the desktop application, you agree to be bound by these Terms of Use. If you do not agree, please do not use the Service.`,
      ],
    },
    {
      heading: "2. The service",
      paragraphs: [
        `${config.appName} is a free collection of tools for working with PDF and related document formats. All processing happens locally on your own device; the Service does not upload or store your files.`,
        "The Service is provided free of charge, without accounts or subscriptions, and is offered on an as-available basis.",
      ],
    },
    {
      heading: "3. Open-source license",
      paragraphs: [
        "The software behind the Service is open source and licensed under the GNU General Public License v3.0 (GPL-3.0). You are free to use, study, modify, and redistribute it under the terms of that license. The full source code is available on GitHub.",
        "These Terms of Use govern your use of the hosted website and distributed application; the GPL-3.0 governs your rights to the source code itself.",
      ],
    },
    {
      heading: "4. Acceptable use",
      paragraphs: ["You agree not to use the Service to:"],
      list: [
        "Process content you do not have the legal right to process.",
        "Violate any applicable law or the rights of others.",
        "Attempt to disrupt or compromise the integrity or security of the website.",
      ],
    },
    {
      heading: "5. Your files and content",
      paragraphs: [
        "You retain all rights to the files you process. Because processing is entirely local, you are solely responsible for your files, for keeping your own backups, and for the results you download. We never receive, see, or store your content.",
      ],
    },
    {
      heading: "6. Disclaimer of warranties",
      paragraphs: [
        'The Service is provided "as is" and "as available", without warranties of any kind, whether express or implied, including but not limited to fitness for a particular purpose, accuracy, or non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or that processed output will be suitable for any specific purpose. Always verify important results.',
      ],
    },
    {
      heading: "7. Limitation of liability",
      paragraphs: [
        "To the maximum extent permitted by law, the authors and contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, files, profits, or goodwill, arising from your use of or inability to use the Service.",
      ],
    },
    {
      heading: "8. Third-party services and advertising",
      paragraphs: [
        "The web version may display third-party advertising and use analytics, as described in our Privacy Policy. Your interactions with third-party advertisers are solely between you and them. Links to third-party sites are provided for convenience and are not endorsements.",
      ],
    },
    {
      heading: "9. Changes to these terms",
      paragraphs: [
        "We may revise these Terms of Use from time to time. The date at the top of this page indicates when they were last updated. Continued use of the Service after changes take effect constitutes acceptance of the revised terms.",
      ],
    },
    {
      heading: "10. Contact",
      paragraphs: [
        `Questions about these Terms of Use can be sent to ${config.supportEmail}.`,
      ],
    },
  ];
</script>

<Seo
  title={`Terms of Use — ${config.appName}`}
  description={`The terms governing your use of ${config.appName}, a free, open-source, privacy-first PDF toolkit that runs entirely on your device.`}
  keywords={["terms of use", "orbit pdf terms", "terms and conditions"]}
/>

<LegalPage
  eyebrow="Legal"
  title="Terms of Use"
  intro={`These terms govern your use of ${config.appName}. They are intentionally short and plain — the Service is free, open source, and runs entirely on your device.`}
  updated="June 7, 2026"
  {sections}
/>
