import { dev } from '$app/environment';
import {
    PUBLIC_ADSENSE_PUBLISHER_ID,
    PUBLIC_GOOGLE_ANALYTICS_ID
} from '$env/static/public';

const config = {
    appName: 'Orbit PDF',
    appVersion: '0.1.0',
    appDescription: `Free, fast, and offline PDF toolkit for professionals. Edit, convert, and process PDFs entirely in your browser with no data uploads. 100% client-side processing.`,
    appKeywords: ['free pdf tools', 'offline pdf editor', 'client-side pdf processing', 'fast pdf converter', 'privacy-focused pdf toolkit', 'web-based pdf tool', 'no upload pdf processing', 'open source pdf'],
    supportEmail: "support@nexonauts.com",
    appDomain: "orbit.nexonauts.com",
    github: "https://github.com/kanakkholwal/orbit",
    adsensePublisherId: dev ? "" : (PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || ""),
    googleAnalyticsId: dev ? "" : (PUBLIC_GOOGLE_ANALYTICS_ID?.trim() || ""),
}
Object.freeze(config);

export { config };

const faqs = [
     {
      question: "Is this tool really free?",
      answer: "Yes! The platform is completely free and open source. There are no hidden costs, subscriptions, paywalls, or premium-only features. You can use it as much as you want."
    },
    {
      question: "Does it work without internet?",
      answer: "Yes, the web app can be used offline once the initial page has loaded. For reliable continuous offline usage, we highly recommend installing the desktop application."
    },
    {
      question: "What file formats are supported?",
      answer: "Primarily PDF files (.pdf). For specific tools like image conversion, we also support JPG, PNG, and HEIC formats. Document conversion handles Word (.docx) and PowerPoint (.pptx)."
    },
    {
      question: "Is there a file size limit?",
      answer: "No hard limits! Because processing happens on your machine, it is limited only by your device's available RAM and CPU. Modern computers can easily handle PDFs well over 500MB."
    },
    {
      question: "Can I contribute or report issues?",
      answer: "We welcome bug reports, feature requests, and code contributions from the community. You can contribute on our GitHub repository."
    }
];
Object.freeze(faqs);

export { faqs };
