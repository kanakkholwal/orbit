<script lang="ts">
  import Seo from "$components/Seo.svelte";
  import WorkspaceHome from "$components/layout/WorkspaceHome.svelte";
  import { config } from "$constants/app";
</script>

<Seo
  title="{config.appName} — Workspace"
  description={config.appDescription}
  keywords={config.appKeywords}
/>

<div class="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
  <WorkspaceHome />
</div>
