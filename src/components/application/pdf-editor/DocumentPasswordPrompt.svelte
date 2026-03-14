<script lang="ts">
    import { Button } from "$components/ui/button";
    import { Input } from "$components/ui/input";
    import { Label } from "$components/ui/label";
    import type { DocumentState } from "@embedpdf/core";
    import { useDocumentManagerCapability } from "@embedpdf/plugin-document-manager/svelte";
    import { LockIcon } from "@lucide/svelte";

    interface DocumentPasswordPromptProps {
        documentState: DocumentState | null;
    }

    let { documentState }: DocumentPasswordPromptProps = $props();

    const documentManager = useDocumentManagerCapability();

    let password = $state("");
    let error = $state("");

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        if (!documentState?.id || !password) return;
        documentManager.provides?.retryDocument(documentState.id, { password });
        password = "";
        error = "";
    };
</script>

<div class="flex h-full items-center justify-center bg-muted/20 p-8">
    <div class="w-full max-w-sm rounded-xl border border-border bg-background p-6">
        <div class="mb-4 flex justify-center">
            <div class="flex size-10 items-center justify-center rounded-full bg-muted">
                <LockIcon class="size-4 text-muted-foreground" />
            </div>
        </div>
        <h2 class="mb-1 text-center text-base font-semibold text-foreground">
            Password Required
        </h2>
        <p class="mb-5 text-center text-sm text-muted-foreground">
            This document is password protected.
        </p>

        <form onsubmit={handleSubmit} class="space-y-3">
            <div class="space-y-1.5">
                <Label for="password" class="text-xs">Password</Label>
                <Input
                    id="password"
                    type="password"
                    bind:value={password}
                    placeholder="Enter password"
                    autocomplete="off"
                    class="h-9"
                />
            </div>

            {#if error}
                <p class="text-xs text-destructive">{error}</p>
            {/if}

            <Button type="submit" class="w-full" size="sm">
                Unlock
            </Button>
        </form>
    </div>
</div>
