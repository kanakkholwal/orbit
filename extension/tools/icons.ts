/**
 * Named imports of only the Lucide icons used by the tool manifest.
 * Importing via a map (rather than `import * as icons`) lets the bundler
 * tree-shake everything else out of @lucide/svelte.
 */
import {
  AlignLeft,
  ArrowDownUp,
  Bookmark,
  BookMinus,
  Copy,
  Crop,
  Edit3,
  Eye,
  File,
  FileMinus2,
  FileStack,
  FileText,
  Gauge,
  Highlighter,
  Image,
  Info,
  Layers,
  LayoutTemplate,
  Lock,
  Maximize2,
  Move,
  PaintBucket,
  RefreshCw,
  RotateCw,
  ScanText,
  Scissors,
  Settings,
  Text,
  Trash2,
  Unlock,
  Wand,
  Zap,
} from '@lucide/svelte';
import type { Component } from 'svelte';

const ICON_MAP: Record<string, Component> = {
  'align-left': AlignLeft,
  'arrow-down-up': ArrowDownUp,
  bookmark: Bookmark,
  'book-minus': BookMinus,
  copy: Copy,
  crop: Crop,
  'edit-3': Edit3,
  eye: Eye,
  file: File,
  'file-minus-2': FileMinus2,
  'file-stack': FileStack,
  'file-text': FileText,
  gauge: Gauge,
  highlighter: Highlighter,
  image: Image,
  info: Info,
  layers: Layers,
  'layout-template': LayoutTemplate,
  lock: Lock,
  'maximize-2': Maximize2,
  move: Move,
  'paint-bucket': PaintBucket,
  'refresh-cw': RefreshCw,
  'rotate-cw': RotateCw,
  'scan-text': ScanText,
  scissors: Scissors,
  settings: Settings,
  text: Text,
  'trash-2': Trash2,
  unlock: Unlock,
  wand: Wand,
  zap: Zap,
};

export function getIcon(iconName: string): Component | undefined {
  return ICON_MAP[iconName];
}
