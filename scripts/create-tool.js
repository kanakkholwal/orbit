#!/usr/bin/env node
import { promises as fs } from 'fs';
import { join, relative } from 'path';

function pascalCase(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('');
}

function titleCase(name) {
  return name
    .split(/[-_]/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(' ');
}

async function fileExists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: bun run create-tool <folder-name> [category]');
    console.error('  category: essentials | conversion | security | pdf-management (default: pdf-management)');
    process.exit(1);
  }

  if (/\s/.test(name) || !/^[a-z0-9-]+$/.test(name)) {
    console.error('Invalid folder name. Use lowercase letters, numbers and hyphens (kebab-case). No spaces.');
    process.exit(1);
  }

  const category = process.argv[3] || 'pdf-management';
  const validCategories = ['essentials', 'conversion', 'security', 'pdf-management'];
  if (!validCategories.includes(category)) {
    console.error(`Invalid category "${category}". Use one of: ${validCategories.join(', ')}`);
    process.exit(1);
  }

  const cwd = process.cwd();
  const toolDir = join(cwd, 'src', 'tools', name);
  await fs.mkdir(toolDir, { recursive: true });

  const classBase = pascalCase(name);
  const stateClass = `${classBase}State`;
  const title = titleCase(name);

  const helperPath = join(toolDir, 'helper.svelte.ts');
  const toolPath = join(toolDir, 'tool.svelte');

  // ── Helper template ───────────────────────────────────────────────────────
  // Convention: a *State class extending PdfEngine (drop to BaseEngine only if
  // you never need PDF.js rendering). Route every async action through
  // `handleProcess` so loading/success/error toasts and `isProcessing` stay
  // consistent. Expose a `reset()`. Use `this.downloadBlob()` to save output.
  const helperTpl = `import { PdfEngine } from '$lib/pdf-engine.svelte';
import { PDFDocument } from 'pdf-lib';

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

export class ${stateClass} extends PdfEngine {
  files = $state<UploadedFile[]>([]);

  async addFiles(newFiles: File[]) {
    if (!newFiles.length) return;
    await this.handleProcess(
      async () => {
        for (const file of newFiles) {
          this.files.push({
            id: crypto.randomUUID(),
            file,
            name: file.name,
            size: file.size,
          });
        }
      },
      { loading: 'Loading…', success: 'Files ready.', error: 'Failed to load file.' }
    );
  }

  removeFile(id: string) {
    this.files = this.files.filter((f) => f.id !== id);
  }

  async process() {
    if (!this.files.length) return;
    await this.handleProcess(
      async () => {
        // TODO: implement the ${name} operation.
        const doc = await PDFDocument.load(await this.files[0].file.arrayBuffer(), {
          ignoreEncryption: true,
        });
        const bytes = await doc.save();
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        this.downloadBlob(blob, \`${name}_\${Date.now()}.pdf\`);
      },
      { loading: 'Processing…', success: 'Done!', error: 'Something went wrong.' }
    );
  }

  reset() {
    this.files = [];
  }
}
`;

  // ── Tool UI template ──────────────────────────────────────────────────────
  const toolTpl = `<script lang="ts">
  import { ToolBar, ToolFooter, ToolPanel, FileRow } from '$components/tool';
  import { Button } from '$components/ui/button';
  import UploadArea from '$components/ui/UploadArea.svelte';
  import { LoaderCircle } from '@lucide/svelte';
  import { ${stateClass} } from './helper.svelte';

  const store = new ${stateClass}();
</script>

{#if store.files.length === 0}
  <UploadArea accept="application/pdf" multiple onFilesSelected={(f) => store.addFiles(f)} />
{:else}
  <div class="flex flex-col gap-8">
    <ToolBar label="${title}" count={store.files.length} onReset={() => store.reset()} />

    <ToolPanel title="Files" counter={store.files.length}>
      <ul class="flex flex-col gap-2">
        {#each store.files as file (file.id)}
          <li>
            <FileRow name={file.name} onRemove={() => store.removeFile(file.id)} />
          </li>
        {/each}
      </ul>
    </ToolPanel>

    <ToolFooter hint={store.isProcessing ? store.progressLabel : 'Run ${title}'}>
      <Button size="lg" onclick={() => store.process()} disabled={store.isProcessing}>
        {#if store.isProcessing}
          <LoaderCircle class="size-4 animate-spin" />
        {/if}
        ${title}
      </Button>
    </ToolFooter>
  </div>
{/if}
`;

  let created = false;
  for (const [path, tpl] of [
    [helperPath, helperTpl],
    [toolPath, toolTpl],
  ]) {
    if (await fileExists(path)) {
      console.log(`• Skipping existing: ${relative(cwd, path)}`);
    } else {
      await fs.writeFile(path, tpl, 'utf8');
      console.log(`✓ Created ${relative(cwd, path)}`);
      created = true;
    }
  }

  // ── Auto-register in src/tools/list.ts ────────────────────────────────────
  const listPath = join(cwd, 'src', 'tools', 'list.ts');
  let list = await fs.readFile(listPath, 'utf8');

  if (list.includes(`'${name}':`) || list.includes(`"${name}":`)) {
    console.log(`• Already registered in src/tools/list.ts`);
  } else {
    const entry = `    '${name}': {
        slug: '${name}',
        title: '${title}',
        description: 'TODO: write an SEO-friendly description for ${title}.',
        category: '${category}',
        icon: FileText, // TODO: pick a fitting @lucide/svelte icon
        component: () => import('./${name}/tool.svelte'),
        color: 'text-primary',
        keywords: ['${name.replace(/-/g, ' ')}']
    },
`;
    const anchor = 'Object.freeze(tools);';
    const idx = list.indexOf(anchor);
    if (idx === -1) {
      console.warn('! Could not find "Object.freeze(tools);" — register the tool manually.');
    } else {
      const before = list.slice(0, idx);
      const closeIdx = before.lastIndexOf('};');
      list = before.slice(0, closeIdx) + entry + before.slice(closeIdx) + list.slice(idx);
      if (!/\bFileText\b/.test(list.split(anchor)[0].split('\n').slice(0, 40).join('\n'))) {
        // FileText not imported — add it to the @lucide/svelte import block.
        list = list.replace(/(import \{)([\s\S]*?)(\} from '@lucide\/svelte';)/, (m, a, body, c) =>
          body.includes('FileText') ? m : `${a}${body}    FileText,\n${c}`
        );
      }
      await fs.writeFile(listPath, list, 'utf8');
      console.log(`✓ Registered '${name}' in src/tools/list.ts (category: ${category})`);
    }
  }

  if (created) {
    console.log(`\nDone. Next: implement the operation in src/tools/${name}/helper.svelte.ts and pick an icon/description in list.ts.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
