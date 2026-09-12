<script lang="ts">
  import { toolList } from "$tools/list";
  import {
    IconCloudOff as CloudOff,
    IconFileTypePdf as FilePdf,
    IconLock as Lock,
    IconPlane as Plane,
    IconRosetteDiscountCheck as Verified,
    IconUserOff as UserOff,
    IconWifiOff as WifiOff,
  } from "@tabler/icons-svelte";
  import type { Snippet } from "svelte";

  const half = Math.ceil(toolList.length / 2);
  const marqueeRows = [toolList.slice(0, half), toolList.slice(half)];
</script>

{#snippet card(title: string, body: string, visual: Snippet, className = "")}
  <article
    class="relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-transparent text-card-foreground transition-shadow duration-150 hover:shadow-lg md:rounded-3xl {className}"
  >
    <div class="relative z-0 flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 md:p-6">
      {@render visual()}
    </div>
    <div class="relative z-10 p-4 md:px-8 md:pb-6">
      <h3 class="mb-1 text-body font-medium text-foreground md:text-body-lg">{title}</h3>
      <p class="text-body text-muted-foreground md:text-body-lg">{body}</p>
    </div>
  </article>
{/snippet}

{#snippet stayLocal()}
  <div class="flex w-full max-w-sm flex-col items-center gap-3">
    <div class="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
      <span class="grid size-10 shrink-0 place-items-center rounded-lg bg-muted">
        <FilePdf class="size-5 text-foreground" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-body font-medium text-foreground">Tax return 2026.pdf</span>
        <span class="block text-caption text-muted-foreground">Opened on this computer</span>
      </span>
      <Lock class="size-4 shrink-0 text-primary" />
    </div>
    <span aria-hidden="true" class="h-8 border-l-2 border-dashed border-border"></span>
    <span
      class="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-caption font-medium text-muted-foreground"
    >
      <CloudOff class="size-4" />
      Never sent to a server
    </span>
  </div>
{/snippet}

{#snippet offline()}
  <div
    class="flex w-full max-w-xs items-center justify-between gap-4 rounded-xl border border-border bg-card p-3 pl-4 shadow-sm"
  >
    <span class="flex items-center gap-2.5 text-body font-medium text-foreground">
      <Plane class="size-4 text-primary" />
      Airplane mode
    </span>
    <span aria-hidden="true" class="relative h-6 w-10 rounded-full bg-primary">
      <span class="absolute right-0.5 top-0.5 size-5 rounded-full bg-fixed-light shadow-sm"></span>
    </span>
  </div>
  <span class="absolute right-5 top-5 flex items-center gap-1.5 text-caption font-medium text-muted-foreground">
    <WifiOff class="size-3.5" />
    No internet
  </span>
{/snippet}

{#snippet signature()}
  <div class="relative aspect-3/4 w-full max-w-56 rounded-lg border border-border bg-card p-5 shadow-sm">
    <div class="flex flex-col gap-2" aria-hidden="true">
      <span class="h-2 w-2/3 rounded-full bg-muted"></span>
      {#each [92, 80, 88, 70, 84, 60] as w, i (i)}
        <span class="h-1.5 rounded-full bg-muted" style:width={`${w}%`}></span>
      {/each}
    </div>
    <div class="absolute inset-x-5 bottom-6">
      <svg viewBox="0 0 160 48" class="h-12 w-full text-primary" aria-hidden="true">
        <path
          class="signature-path"
          pathLength="1"
          d="M4 34c10-2 14-22 22-22s-6 26 2 26 12-20 18-20-2 18 6 18 10-14 16-14 0 12 8 12c10 0 12-10 20-10s8 6 16 6 16-6 22-8"
          fill="none"
          stroke="currentColor"
          stroke-width="2.25"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="block border-t border-border pt-1.5 text-caption text-muted-foreground">Signature</span>
    </div>
    <span
      class="absolute -right-3 top-8 flex rotate-6 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-caption font-semibold text-primary shadow-sm"
    >
      <Verified class="size-3.5" />
      Signed
    </span>
  </div>
{/snippet}

{#snippet toolMarquee()}
  <div class="marquee-mask flex w-full flex-col gap-2 py-2">
    {#each marqueeRows as row, r (r)}
      <div class="flex w-max gap-2 {r === 0 ? 'marquee' : 'marquee marquee-reverse'}">
        {#each [...row, ...row] as tool, i (`${tool.slug}-${i}`)}
          <span
            class="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-body text-foreground"
            aria-hidden={i >= row.length ? "true" : undefined}
          >
            <tool.icon class="size-4 text-primary" />
            {tool.title}
          </span>
        {/each}
      </div>
    {/each}
  </div>
{/snippet}

{#snippet noAccount()}
  <div class="relative w-full max-w-sm pb-6">
    <div class="relative z-20 flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <span class="grid size-12 shrink-0 place-items-center rounded-xl border border-border">
        <UserOff class="size-6 text-foreground" />
      </span>
      <span class="min-w-0">
        <span class="block text-body-lg font-medium text-foreground">No account needed</span>
        <span class="block text-body text-muted-foreground">Open a tool and drop your file.</span>
      </span>
    </div>
    <div aria-hidden="true" class="absolute inset-x-3 bottom-3 z-10 h-12 rounded-2xl border border-border bg-card"></div>
    <div aria-hidden="true" class="absolute inset-x-6 bottom-0 h-12 rounded-2xl border border-border bg-card"></div>
  </div>
{/snippet}

<div
  class="mx-auto grid min-h-[60vh] w-full grid-cols-1 gap-2 md:gap-4 lg:h-[calc(100svh-6.5rem)] lg:grid-cols-12"
>
  <div class="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-4 lg:grid-rows-[6fr_4fr]">
    {@render card(
      "Your files stay yours",
      "Documents open right in your browser. Nothing is uploaded, stored or shared.",
      stayLocal
    )}
    {@render card("Works without internet", "Install the app and keep working on a plane or a train.", offline)}
  </div>

  {@render card(
    "Sign in seconds",
    "Draw or type your signature and place it anywhere on the page.",
    signature,
    "lg:col-span-3"
  )}

  <div class="grid min-h-0 grid-cols-1 gap-2 md:gap-4 lg:col-span-5 lg:grid-rows-[5fr_5fr]">
    {@render card("Every PDF tool you need", "Merge, split, compress, convert, sign and more. All free.", toolMarquee)}
    {@render card(
      "No sign-up. No watermark.",
      "Your finished file looks exactly like you made it, with no strings attached.",
      noAccount
    )}
  </div>
</div>

<style>
  .marquee-mask {
    mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
  }

  .marquee {
    animation: marquee 48s linear infinite;
  }

  .marquee-reverse {
    animation-direction: reverse;
  }

  .marquee-mask:hover .marquee {
    animation-play-state: paused;
  }

  @keyframes marquee {
    to {
      transform: translateX(calc(-50% - 0.25rem));
    }
  }

  .signature-path {
    stroke-dasharray: 1;
    stroke-dashoffset: 0;
  }

  @media (prefers-reduced-motion: no-preference) {
    .signature-path {
      animation: sign 4.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }
  }

  @keyframes sign {
    0%,
    10% {
      stroke-dashoffset: 1;
    }
    55%,
    100% {
      stroke-dashoffset: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .marquee {
      animation: none;
    }
  }
</style>
