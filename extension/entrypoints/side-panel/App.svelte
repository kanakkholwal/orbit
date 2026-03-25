<script lang="ts">
 
  import ToolList from './ToolList.svelte';
  const ORBIT_URL = import.meta.env.VITE_ORBIT_WEB_URL ?? 'https://orbit.nexonauts.com';

  let search = $state('');
  let dark = $state(false);

  $effect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    dark = mq.matches;
    const onchange = (e: MediaQueryListEvent) => { dark = e.matches; };
    mq.addEventListener('change', onchange);
    return () => mq.removeEventListener('change', onchange);
  });
</script>

<div class:dark class="flex h-screen flex-col bg-background text-foreground">

  <!-- Header -->
  <header class="flex shrink-0 items-center gap-2.5 border-b border-border bg-card px-4 py-3">
    <img src="/icons/icon32.png" alt="" class="size-5 shrink-0" />
    <span class="text-sm font-semibold tracking-tight">Orbit PDF</span>
    <a
      href={ORBIT_URL}
      target="_blank"
      rel="noopener noreferrer"
      class="ml-auto flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      Open app
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
    </a>
  </header>

  <!-- Search -->
  <div class="shrink-0 border-b border-border bg-background px-4 py-2.5">
    <div class="relative">
      <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="search"
        placeholder="Search tools…"
        bind:value={search}
        class="w-full rounded-lg border border-border bg-card py-1.5 pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-colors"
      />
    </div>
  </div>

  <!-- Tool list -->
  <div class="min-h-0 flex-1 overflow-y-auto">
    <ToolList {search} orbitUrl={ORBIT_URL} />
  </div>

  <!-- Footer -->
  <footer class="shrink-0 border-t border-border px-4 py-2.5 text-center text-[11px] text-muted-foreground">
    All processing is local — nothing leaves your device.
  </footer>

</div>
