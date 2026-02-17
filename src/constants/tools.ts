import {
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Lock,
  Merge,
  PenLineIcon,
  RotateCw,
  Shield,
  Split,
  Zap
} from "@lucide/svelte";

export const toolsCategories = [
  {
    id: "essentials",
    name: "Essentials",
    description: "Daily drivers for PDF management.",
    icon: FileText,
    tools: [
      {
        id: "multi-pdf",
        title: "PDF Multi-Tool",
        desc: "Upload, rearrange, rotate, and export multiple PDF pages with ease.",
        icon: FileText,
        color: "text-primary bg-blue-50",
      },
      {
        id: "merge-pdf",
        title: "Merge PDF",
        desc: "Combine multiple files into one.",
        icon: Merge,
        color: "text-primary bg-blue-50",
      },
      {
        id: "split-pdf",
        title: "Split PDF",
        desc: "Extract pages or split documents.",
        icon: Split,
        color: "text-orange-600 bg-orange-50",
      },
      {
        id: "compress-pdf",
        title: "Compress",
        desc: "Reduce file size efficiently.",
        icon: Zap,
        color: "text-green-600 bg-green-50",
      },
    ],
  },
  {
    id: "security",
    name: "Security",
    description: "Protect sensitive information.",
    icon: Shield,
    tools: [

      {
        id: "encrypt-pdf",
        title: "Encrypt PDF",
        desc: "Encrypt with password.",
        icon: Lock,
        color: "text-indigo-600 bg-indigo-50",
      },
      {
        id: "decrypt-pdf",
        title: "Decrypt PDF",
        desc: "Remove passwords instantly.",
        icon: Shield,
        color: "text-red-600 bg-red-50",
      },
    ],
  },
  {
    id: "convert",
    name: "Conversion",
    description: "Transform documents to other formats.",
    icon: RotateCw,
    tools: [
      {
        id: "pdf-to-img",
        title: "PDF to Images",
        desc: "Convert pages to images.",
        icon: ImageIcon,
        color: "text-purple-600 bg-purple-50",
      },
      {
        id: "img-to-pdf",
        title: 'Image to PDF',
        desc: 'Convert images to PDF instantly. Supports JPG, PNG, and more.',
        icon: FileText,
        color: "text-pink-600 bg-pink-50",
      },
    ],
  },
  {
    id: "edit",
    name: "Editing",
    description: "Modify page layout and content.",
    icon: PenLineIcon,
    tools: [
      {
        id: "rotate-pdf",
        title: "Rotate PDF",
        desc: "Fix page orientation.",
        icon: RotateCw,
        color: "text-cyan-600 bg-cyan-50",
      },
      {
        id: "organize-pdf",
        title: "Organize",
        desc: "Reorder and delete pages.",
        icon: LayoutTemplate,
        color: "text-teal-600 bg-teal-50",
      },
    ],
  },
];

export const categories = toolsCategories.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  icon: c.icon,
}));

export const tools = toolsCategories.flatMap((c) => c.tools);

export function getTool(slug: string) {
  for (const category of toolsCategories) {
    const tool = category.tools.find((t) => t.id === slug);
    if (tool) {
      return tool;
    }
  }
  return null;
}