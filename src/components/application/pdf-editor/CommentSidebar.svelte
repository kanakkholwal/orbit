<script lang="ts">
    interface Props {
        documentId: string;
        onClose?: () => void;
    }

    let { documentId, onClose }: Props = $props();
</script>

<div class="flex h-full flex-col">
    <div class="flex flex-1 items-center justify-center p-4">
        <p class="text-xs text-muted-foreground">No comments yet</p>
    </div>
</div>
