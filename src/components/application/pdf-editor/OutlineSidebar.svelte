<script lang="ts">
    interface Props {
        documentId: string;
        tabId?: string;
        onClose?: () => void;
    }

    let { documentId, tabId, onClose }: Props = $props();
</script>

<div class="flex h-full flex-col">
    <div class="flex flex-1 items-center justify-center p-4">
        <p class="text-xs text-muted-foreground">Outline not available</p>
    </div>
</div>
