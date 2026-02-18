import { getToolsByCategory } from "$tools/list";
import {
  FileText,
  Icon,
  PenLineIcon,
  RotateCw,
  Shield
} from "@lucide/svelte";


interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: typeof Icon; 
  tools?: ReturnType<typeof getToolsByCategory>; 
}

const toolsCategories: ToolCategory[] = [
  {
    id: "essentials",
    name: "Essentials",
    description: "Daily drivers for PDF management.",
    icon: FileText,

  },
  {
    id: "security",
    name: "Security",
    description: "Protect sensitive information.",
    icon: Shield,

  },
  {
    id: "conversion",
    name: "Conversion",
    description: "Transform documents to other formats.",
    icon: RotateCw,

  },
  {
    id: "pdf-management",
    name: "PDF Management",
    description: "Modify page layout and content.",
    icon: PenLineIcon,

  },
];


const categories = toolsCategories.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  icon: c.icon,
}));

for (const category of toolsCategories) {
  if (!category?.tools) {
    category.tools = [];
  }
  category.tools = getToolsByCategory(category.id);
}


export { categories, toolsCategories };

