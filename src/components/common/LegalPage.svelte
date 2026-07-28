<script lang="ts">
  import Footer from "$components/common/footer.svelte";
  import Navbar from "$components/common/navbar.svelte";

  interface LegalSection {
    heading: string;
    paragraphs?: string[];
    list?: string[];
  }

  let {
    eyebrow = "Legal",
    title,
    intro,
    updated,
    sections,
  }: {
    eyebrow?: string;
    title: string;
    intro: string;
    updated: string;
    sections: LegalSection[];
  } = $props();
</script>

<div class="relative flex min-h-screen w-full flex-col">
  <Navbar />

  <main class="mx-auto w-full max-w-3xl px-5 pb-24 pt-32 md:px-8 md:pt-40">
    <header class="flex flex-col gap-5 border-b border-border/60 pb-10">
      <span class="label-eyebrow text-primary">{eyebrow}</span>
      <h1 class="text-display-md text-foreground sm:text-display-lg">
        {title}
      </h1>
      <p class="max-w-2xl text-base leading-relaxed text-muted-foreground">
        {intro}
      </p>
      <p class="label-eyebrow text-muted-foreground">
        Last updated · {updated}
      </p>
    </header>

    <div class="flex flex-col gap-12 py-12">
      {#each sections as section (section.heading)}
        <section class="flex flex-col gap-4">
          <h2 class="text-title-md text-foreground">{section.heading}</h2>
          {#if section.paragraphs}
            {#each section.paragraphs as p (p)}
              <p class="text-base leading-relaxed text-muted-foreground">{p}</p>
            {/each}
          {/if}
          {#if section.list}
            <ul class="flex flex-col gap-2.5 pl-1">
              {#each section.list as item (item)}
                <li class="flex gap-3 text-base leading-relaxed text-muted-foreground">
                  <span class="mt-2.5 size-1 shrink-0 rounded-full bg-primary"></span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </section>
      {/each}
    </div>
  </main>

  <Footer />
</div>
