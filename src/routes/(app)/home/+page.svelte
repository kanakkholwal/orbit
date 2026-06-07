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

<WorkspaceHome />
