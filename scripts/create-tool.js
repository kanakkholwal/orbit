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

async function fileExists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: node scripts/create-tool.js <folder-name>');
    process.exit(1);
  }

  // Validate: no whitespace, allow letters, numbers, hyphen and underscore
  if (/\s/.test(name) || !/^[A-Za-z0-9_-]+$/.test(name)) {
    console.error('Invalid folder name. Use letters, numbers, hyphen (-) or underscore (_). No spaces allowed.');
    process.exit(1);
  }

  const cwd = process.cwd();
  const toolDir = join(cwd, 'src', 'tools', name);
  await fs.mkdir(toolDir, { recursive: true });

  const classBase = pascalCase(name);
  const stateClass = `${classBase}State`;

  const helperPath = join(toolDir, 'helper.svelte.ts');
  const toolPath = join(toolDir, 'tool.svelte');

  const helperTpl = `import { PdfEngine } from '$lib/pdf-engine.svelte';

// State class for the ${name} tool
export class ${stateClass} extends PdfEngine {
  // Example reactive state; adapt as needed
  files = $state<any[]>([]);

  constructor() {
    super();
  }

  // Add methods the tool needs
}
`;

  const toolTpl = `<script lang="ts">
  import { ${stateClass} } from './helper.svelte';

  const store = new ${stateClass}();
</script>

<div class="h-full w-full">
  <!-- TODO: implement UI for the ${name} tool -->
  <p class="text-sm text-muted-foreground">${name} tool placeholder</p>
</div>
`;

  if (await fileExists(helperPath)) {
    console.log(`Skipping existing file: ${relative(cwd, helperPath)}`);
  } else {
    await fs.writeFile(helperPath, helperTpl, { encoding: 'utf8' });
    console.log(`Created ${relative(cwd, helperPath)}`);
  }

  if (await fileExists(toolPath)) {
    console.log(`Skipping existing file: ${relative(cwd, toolPath)}`);
  } else {
    await fs.writeFile(toolPath, toolTpl, { encoding: 'utf8' });
    console.log(`Created ${relative(cwd, toolPath)}`);
  }

  console.log('Done. Remember to import your new tool in `src/tools/list.ts` if needed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
