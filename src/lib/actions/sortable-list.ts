import Sortable, { type Options } from 'sortablejs';

export interface SortableListParams {
    /** Called with the drag source/target indices after the DOM move is reverted. */
    onReorder: (oldIndex: number, newIndex: number) => void;
    /** Extra Sortable options (handle, delay, dragClass, …) merged over the defaults. */
    options?: Options;
}

/**
 * Immutably move an item within a list and return a new array.
 * Pairs with {@link sortableList} so reorder handlers stay one-liners.
 */
export function arrayMove<T>(list: readonly T[], from: number, to: number): T[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

/**
 * Svelte action wrapping Sortable.js for lists/grids rendered by a keyed
 * `{#each}`.
 *
 * Sortable mutates the DOM directly on drop. If the same items are also driven
 * by a Svelte keyed each, Sortable's DOM mutation and Svelte's reconciliation
 * fight — the reorder appears to do nothing or duplicates nodes (notably in the
 * Tauri WebView, where the timing makes it reproducible). The fix: REVERT
 * Sortable's DOM move here, then hand the indices to `onReorder` and let Svelte
 * render the new order from the (now authoritative) data.
 *
 * Usage:
 *   use:sortableList={{ onReorder: (o, n) => (store.files = arrayMove(store.files, o, n)) }}
 *   use:sortableList={{ onReorder: reorder, options: { handle: '.drag-handle' } }}
 */
export function sortableList(node: HTMLElement, params: SortableListParams) {
    let onReorder = params.onReorder;

    const sortable = Sortable.create(node, {
        animation: 150,
        ghostClass: 'opacity-50',
        // Use the pointer-based fallback instead of the HTML5 Drag-and-Drop API.
        // Tauri's native drag-drop (dragDropEnabled, also used for file intake)
        // intercepts HTML5 DnD inside the WebView — especially Windows WebView2 —
        // so without this, dragging silently does nothing on the desktop build.
        // The fallback drives sorting from mouse/touch events and works in both
        // the browser and Tauri.
        forceFallback: true,
        fallbackTolerance: 3,
        ...params.options,
        onEnd: (evt) => {
            const { oldIndex, newIndex, item, from } = evt;
            if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
            // Put the dragged node back where it started so Svelte's keyed each
            // remains the single source of truth, then update the data.
            from.removeChild(item);
            from.insertBefore(item, from.children[oldIndex] ?? null);
            onReorder(oldIndex, newIndex);
        }
    });

    return {
        update(next: SortableListParams) {
            onReorder = next.onReorder;
        },
        destroy() {
            sortable.destroy();
        }
    };
}
