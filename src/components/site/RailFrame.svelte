<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";
  import { cn } from "$lib/utils";
  import type { Snippet } from "svelte";

  type Props = { class?: string; children: Snippet };

  let { class: className, children }: Props = $props();
</script>

<div class={cn("relative flex min-h-screen w-full flex-col overflow-x-clip bg-background", className)}>
  <Navbar />
  <main class="flex flex-1 flex-col">
    {@render children()}
  </main>
  <Footer />
</div>
