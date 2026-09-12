<script lang="ts">
  import { page } from "$app/state";
  import ErrorState from "$components/common/ErrorState.svelte";
  import Seo from "$components/Seo.svelte";
  import { RailFrame, RailRow } from "$components/site";
</script>

<Seo title={page.status === 404 ? "Page not found" : "Something went wrong"} />
<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<RailFrame>
  <RailRow divider={false} label={`Error ${page.status}`} class="flex-1">
    <div class="px-1 pb-14 pt-28 sm:px-4 sm:pb-20 sm:pt-32 lg:px-16">
      <ErrorState status={page.status} message={page.error?.message} class="max-w-2xl" />
    </div>
  </RailRow>
</RailFrame>
