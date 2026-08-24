<script lang="ts">
  import { page } from "$app/stores";
  import "@fontsource-variable/google-sans";

  import {
    IconAlertTriangle as AlertTriangle,
    IconArrowLeft as ArrowLeft,
    IconBarrierBlock as Construction,
    IconFileUnknown as FileQuestion,
    IconHome as Home,
    IconRefresh as RefreshCcw,
  } from "@tabler/icons-svelte";
  import "../app.css";

  // Derived state for error details
  $: status = $page.status;
  $: message = $page.error?.message || "An unexpected error occurred.";

  // Dynamic content based on status code
  $: isNotFound = status === 404;
  $: isServerError = status >= 500;

  $: errorTitle = isNotFound
    ? "Page not found"
    : isServerError
      ? "Server Error"
      : "Something went wrong";

  $: errorDesc = isNotFound
    ? "Sorry, we couldn't find the page you're looking for. It might have been moved or deleted."
    : "Our servers ran into a bit of a hiccup. We're working on fixing it.";

  function goBack() {
    history.back();
  }
</script>

<div
  class="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
>
    <div
      class="overflow-hidden relative w-full max-w-lg  rounded-3xl border border-border bg-card/40 p-3 py-6 mb-5 backdrop-blur-x"
    >
      <div class="flex flex-col items-center px-8 py-12 text-center sm:px-12">
        <div
          class="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-card shadow-lg"
        >
          {#if isNotFound}
            <FileQuestion class="h-10 w-10 text-blue-500" stroke={1.5} />
          {:else if isServerError}
            <Construction class="h-10 w-10 text-orange-500" stroke={1.5} />
          {:else}
            <AlertTriangle class="h-10 w-10 text-red-500" stroke={1.5} />
          {/if}
        </div>

        <p
          class="label-eyebrow mb-2 text-muted-foreground"
        >
          Error {status}
        </p>

        <h1
          class="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          {errorTitle}
        </h1>

        <p class="mb-8 text-body leading-relaxed text-muted-foreground">
          {errorDesc}
          <span
            class="block mt-2 text-caption opacity-70 font-mono bg-muted/50 py-1 px-2 rounded"
          >
            details: {message}
          </span>
        </p>

        <div class="flex w-full flex-col gap-3 sm:flex-row">
          <button
            on:click={goBack}
            class="group flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-4 py-3 text-body-sm font-semibold text-card-foreground shadow-sm transition-all hover:bg-card hover:text-foreground hover:shadow-md active:brightness-95"
          >
            <ArrowLeft
              size={16}
              class="transition-transform group-hover:-translate-x-1"
            />
            Go Back
          </button>

          <a
            href="/"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-body-sm font-semibold text-card shadow-lg shadow-foreground/20 transition-all hover:bg-foreground hover:shadow-xl active:brightness-95"
          >
            <Home size={16} />
            Home
          </a>
        </div>

        {#if !isNotFound}
          <button
            on:click={() => location.reload()}
            class="mt-6 flex items-center gap-1.5 text-caption font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCcw size={12} />
            Try reloading the page
          </button>
        {/if}

        <div class="mt-8 text-center text-caption text-muted-foreground">
          Need help? <a
            href="mailto:support@nexonauts.com"
            class="font-medium text-foreground hover:underline"
            >Contact Support</a
          >
        </div>
      </div>
    </div>
</div>
