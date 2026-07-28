<script lang="ts">
  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import { IconBrandGithub as GithubIcon } from "@tabler/icons-svelte";
  import { IconHeart as HeartIcon } from "@tabler/icons-svelte";
  import { IconX as XIcon } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  const STORAGE_KEY = "orbit:feedback-prompt:dismissed";
  const DELAY_MS = 25_000;

  let visible = $state(false);
  let mounted = $state(false);

  const tweetText = encodeURIComponent(
    `I've been using ${config.appName} — a free, offline, privacy-first PDF toolkit. ${config.github}`,
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  function dismiss(persist = true) {
    visible = false;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {}
    }
  }

  function onAction() {
    dismiss(true);
  }

  onMount(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (dismissed) return;

    const t = setTimeout(() => {
      visible = true;
      requestAnimationFrame(() => (mounted = true));
    }, DELAY_MS);

    return () => clearTimeout(t);
  });
</script>

{#if visible}
  <div
    role="dialog"
    aria-label="Share feedback"
    class={[
      "fixed bottom-4 right-4 z-50 w-[min(92vw,22rem)]",
      "rounded-xl border bg-background/95 backdrop-blur shadow-xl",
      "p-4 transition-all duration-300 ease-out",
      mounted
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-3 pointer-events-none",
    ].join(" ")}
  >
    <button
      type="button"
      aria-label="Dismiss"
      onclick={() => dismiss(true)}
      class="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
    >
      <XIcon class="size-4" />
    </button>

    <div class="flex items-start gap-3 pr-6">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <HeartIcon class="size-4" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold leading-tight">
          Enjoying {config.appName}?
        </p>
        <p class="text-xs text-muted-foreground leading-snug">
          Share a quick testimonial on X or drop a star on GitHub — it really
          helps.
        </p>
      </div>
    </div>

    <div class="mt-3 flex gap-2">
      <Button
        href={tweetUrl}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        variant="default"
        class="flex-1"
        onclick={onAction}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-3.5"
          aria-hidden="true"
        >
          <path
            d="M18.244 2H21l-6.52 7.45L22 22h-6.79l-4.74-6.2L4.8 22H2.04l6.98-7.97L2 2h6.91l4.28 5.66L18.24 2Zm-2.38 18h1.86L8.22 4H6.27l9.6 16Z"
          />
        </svg>
        Tweet
      </Button>
      <Button
        href={config.github}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        variant="outline"
        class="flex-1"
        onclick={onAction}
      >
        <GithubIcon class="size-3.5" />
        Star
      </Button>
    </div>
  </div>
{/if}
