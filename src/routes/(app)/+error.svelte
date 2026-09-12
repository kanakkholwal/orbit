<script lang="ts">
  import { page } from "$app/state";
  import ErrorState from "$components/common/ErrorState.svelte";
  import Seo from "$components/Seo.svelte";
</script>

<Seo title={page.status === 404 ? "Tool not found" : "Something went wrong"} noindex />

<div class="flex min-h-full items-center px-4 py-12 sm:px-8 md:py-16">
  <ErrorState
    status={page.status}
    message={page.error?.message}
    context="workspace"
    missing={page.url.pathname.startsWith("/tools/") ? "tool" : "page"}
    class="mx-auto max-w-2xl"
  />
</div>
