<script lang="ts">
  import Navbar from "$components/common/navbar.svelte";
  import { Input } from "$components/ui/input";
  import { toolList } from "$tools/list";
  import { ArrowRight, Search } from "@lucide/svelte";

  // Desktop apps benefit from quick filtering
  let searchQuery = $state("");

  let filteredTools = $derived(
    toolList.filter(
      (tool) =>
        tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
</script>

<div class="flex h-screen w-full flex-col overflow-hidden">
  <Navbar />

  <main class="flex-1 overflow-y-auto bg-muted/10 p-6 lg:p-10">
    <div class="mx-auto max-w-7xl">
      
      <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-foreground">PDF Tools</h1>
          <p class="text-sm text-muted-foreground mt-1">Select a tool to process your documents locally.</p>
        </div>
        
        <div class="relative w-full sm:w-72">
          <Search class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search tools..." 
            bind:value={searchQuery}
            class="pl-9 shadow-sm"
          />
        </div>
      </div>

      {#if filteredTools.length === 0}
        <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Search class="mb-4 size-10 opacity-20" />
          <p>No tools found matching "{searchQuery}"</p>
        </div>
      {:else}
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {#each filteredTools as tool}
            <a
              href={`/tools/${tool.slug}`}
              class="group relative flex flex-col p-5 h-full rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30"
            >
              <div class="relative z-10 flex flex-col h-full">
                <div class={`size-12 rounded-xl flex items-center justify-center mb-4 shadow-sm ring-1 ring-border/50 bg-background ${tool.color}`}>
                  {#if tool.icon}
                    {@const Icon = tool.icon}
                    <Icon size={22} strokeWidth={1.5} class="group-hover:scale-110 transition-transform duration-300" />
                  {/if}
                </div>

                <h3 class="text-base font-semibold tracking-tight text-foreground mb-1.5">
                  {tool.title}
                </h3>
                <p class="text-sm text-muted-foreground leading-snug line-clamp-2 flex-1">
                  {tool.description}
                </p>

                <div class="mt-4 flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Open Tool
                  <ArrowRight size={14} class="ml-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}

    </div>
  </main>
</div>