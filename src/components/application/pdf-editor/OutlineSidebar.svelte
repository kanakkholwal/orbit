<script lang="ts">
  import { IconListTree as Outline } from "$lib/icons";

  interface Props {
    documentId: string;
    tabId?: string;
    onClose?: () => void;
  }

  let _props: Props = $props();
</script>

<div class="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
  <Outline class="size-5 text-muted-foreground" />
  <p class="text-sm font-medium text-foreground">Outline not available</p>
  <p class="text-sm text-muted-foreground">Use Thumbnails to jump between pages.</p>
</div>
