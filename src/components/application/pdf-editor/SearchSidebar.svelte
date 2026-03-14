<script lang="ts">
    import Search from "./Search.svelte";

    interface SearchSidebarProps {
        documentId: string;
    }

    let { documentId }: SearchSidebarProps = $props();
</script>

<div class="flex h-full w-72 flex-col bg-background">
    <Search {documentId} />
</div>
