<script lang="ts">
    import { goto } from '$app/navigation';
    import { wasmStore } from '$stores/wasm-store.svelte';
    import { IconAlertTriangle as AlertTriangle, IconCheck as Check } from '@tabler/icons-svelte';
    import { fade, scale } from 'svelte/transition';
 // Assuming SvelteKit

    // Derived values from the store
    let isOpen = $derived(wasmStore.dialogState.isOpen);
    let pkg = $derived(wasmStore.dialogState.packageName);
    
    let displayName = $derived(pkg ? wasmStore.getDisplayName(pkg) : '');
    let features = $derived(pkg ? wasmStore.getFeatures(pkg) : []);

    function handleConfigure() {
        wasmStore.closeDialog();
        // Redirect to settings page (ensure this route exists)
        goto('/settings/wasm');
    }
</script>

{#if isOpen && pkg}
    <div 
        tabindex="-1"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        transition:fade={{ duration: 200 }}
        onclick={() => wasmStore.closeDialog()}
        onkeydown={(e) => e.key === 'Escape' && wasmStore.closeDialog()}
        role="dialog"
        aria-modal="true">
        <div 
            class="w-full max-w-md overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl"
            transition:scale={{ start: 0.95, duration: 200 }}
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.stopPropagation()}
            role="button"
            tabindex="0"
        >
        
            <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                        <AlertTriangle class="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold text-white">Advanced Feature Required</h3>
                        <p class="text-sm text-gray-400">External processing module needed</p>
                    </div>
                </div>

                <p class="mb-4 text-gray-300">
                    This feature requires <strong class="text-white">{displayName}</strong> to be configured.
                </p>

                <div class="mb-4 rounded-lg bg-gray-700/50 p-4">
                    <p class="mb-2 text-sm text-gray-400">Features enabled by this module:</p>
                    <ul class="space-y-1 text-sm text-gray-300">
                        {#each features.slice(0, 4) as feature}
                            <li class="flex items-center gap-2">
                                <Check class="h-4 w-4 text-green-400" />
                                {feature}
                            </li>
                        {/each}
                        {#if features.length > 4}
                            <li class="pl-6 text-gray-500">+ {features.length - 4} more...</li>
                        {/if}
                    </ul>
                </div>

                <p class="text-xs text-gray-500">
                    This module is licensed under AGPL-3.0. By configuring it, you agree to its license terms.
                </p>
            </div>

            <div class="flex gap-3 border-t border-gray-700 p-4">
                <button 
                    class="flex-1 rounded-lg bg-gray-700 px-4 py-2.5 font-medium text-gray-300 transition-colors hover:bg-gray-600"
                    onclick={() => wasmStore.closeDialog()}
                >
                    Cancel
                </button>
                <button 
                    class="flex-1 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 px-4 py-2.5 font-medium text-white transition-all hover:from-blue-500 hover:to-blue-400"
                    onclick={handleConfigure}
                >
                    Configure
                </button>
            </div>
        </div>
    </div>
{/if}