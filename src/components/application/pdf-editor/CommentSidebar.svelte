<script lang="ts">
  import { IconMessage as Message } from "$lib/icons";

  interface Props {
    documentId: string;
    onClose?: () => void;
  }

  let _props: Props = $props();
</script>

<div class="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
  <Message class="size-5 text-muted-foreground" />
  <p class="text-sm font-medium text-foreground">No comments to show</p>
  <p class="text-sm text-muted-foreground">Comments in this PDF aren't listed here yet.</p>
</div>
