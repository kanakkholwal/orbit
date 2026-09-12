<script lang="ts">
  import { page } from "$app/state";
  import "@fontsource-variable/google-sans";
  import "@fontsource-variable/inter";
  import "../app.css";

  import { Button } from "$components/ui/button";
  import { config } from "$constants/app";
  import {
    IconAlertTriangle as AlertTriangle,
    IconArrowLeft as ArrowLeft,
    IconBarrierBlock as Construction,
    IconFileUnknown as FileQuestion,
    IconRefresh as Refresh,
  } from "@tabler/icons-svelte";

  const status = $derived(page.status);
  const message = $derived(page.error?.message || "An unexpected error occurred.");
  const isNotFound = $derived(status === 404);
  const isServerError = $derived(status >= 500);

  const title = $derived(isNotFound ? "Page not" : isServerError ? "Something broke" : "Something went");
  const accent = $derived(isNotFound ? "found" : isServerError ? "on our side" : "wrong");
  const description = $derived(
    isNotFound
      ? "We couldn't find that page. It may have moved, or the link might be mistyped."
      : "Your files are safe, they never left your device. Try again in a moment."
  );
</script>

<div class="relative flex min-h-screen w-full items-center justify-center overflow-x-clip bg-canvas px-3 py-16 sm:px-6">
  <div
    aria-hidden="true"
    class="rail-column rail-dash pointer-events-none fixed inset-y-0 left-1/2 -translate-x-1/2 border-x-2"
  ></div>

  <div class="panel-card relative flex w-full max-w-lg flex-col items-center px-8 py-12 text-center sm:px-12">
    <span class="mb-6 grid size-16 rotate-2 place-items-center rounded-2xl border border-border bg-card shadow-md">
      {#if isNotFound}
        <FileQuestion class="size-8 text-primary" stroke={1.5} />
      {:else if isServerError}
        <Construction class="size-8 text-warning" stroke={1.5} />
      {:else}
        <AlertTriangle class="size-8 text-destructive" stroke={1.5} />
      {/if}
    </span>

    <span class="mb-3 rounded-md border border-border px-2.5 py-1 text-caption font-semibold text-muted-foreground">
      Error {status}
    </span>

    <h1 class="text-heading-lg font-medium text-foreground">
      {title} <span class="text-primary">{accent}</span>
    </h1>
    <p class="mt-3 text-body text-muted-foreground">{description}</p>

    {#if !isNotFound}
      <p class="mt-4 w-full rounded-lg bg-muted px-3 py-2 font-mono text-caption text-muted-foreground">{message}</p>
    {/if}

    <div class="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
      <Button variant="outline" onclick={() => history.back()}>
        <ArrowLeft />
        Go back
      </Button>
      <Button href="/" variant="primary">Back to home</Button>
    </div>

    {#if !isNotFound}
      <Button variant="ghost" size="sm" class="mt-4 text-muted-foreground" onclick={() => location.reload()}>
        <Refresh />
        Reload the page
      </Button>
    {/if}

    <p class="mt-8 text-caption text-muted-foreground">
      Need help? <a href={`mailto:${config.supportEmail}`} class="font-medium text-foreground underline-offset-4 hover:underline">Contact support</a>
    </p>
  </div>
</div>
