<script lang="ts">
    import { Button } from "$components/ui/button";
    import { Checkbox } from "$components/ui/checkbox";
    import { Input } from "$components/ui/input";
    import { Label } from "$components/ui/label";
    import type { SearchResult } from "@embedpdf/models";
    import { MatchFlag } from "@embedpdf/models";
    import { useScrollCapability } from "@embedpdf/plugin-scroll/svelte";
    import { useSearch } from "@embedpdf/plugin-search/svelte";
    import {
        ChevronDownIcon,
        ChevronUpIcon,
        LoaderCircleIcon,
        SearchIcon,
        XIcon,
    } from "@lucide/svelte";
    import { tick } from "svelte";

    interface SearchProps {
        documentId: string;
    }

    let { documentId }: SearchProps = $props();

    const search = useSearch(() => documentId);
    const scrollCapability = useScrollCapability();

    let inputValue = $state(search.state.query || "");
    let inputRef: HTMLInputElement | undefined;

    $effect(() => {
        tick().then(() => {
            inputRef?.focus();
            inputValue = search.state.query || "";
        });
    });

    $effect(() => {
        if (inputValue === "") {
            search.provides?.stopSearch();
        } else {
            search.provides?.searchAllPages(inputValue);
        }
    });

    $effect(() => {
        if (
            typeof search.state.activeResultIndex === "number" &&
            !search.state.loading &&
            search.state.results.length > 0
        ) {
            scrollToItem(search.state.activeResultIndex);
        }
    });

    const handleFlagChange = (flag: MatchFlag, checked: boolean) => {
        const currentFlags = search.state.flags;
        if (checked) {
            search.provides?.setFlags([...currentFlags, flag]);
        } else {
            search.provides?.setFlags(currentFlags.filter((f) => f !== flag));
        }
    };

    const scrollToItem = (index: number) => {
        const item = search.state.results[index];
        if (!item) return;

        const minCoordinates = item.rects.reduce(
            (min, rect) => ({
                x: Math.min(min.x, rect.origin.x),
                y: Math.min(min.y, rect.origin.y),
            }),
            { x: Infinity, y: Infinity },
        );

        scrollCapability.provides?.scrollToPage({
            pageNumber: item.pageIndex + 1,
            pageCoordinates: minCoordinates,
            alignX: 50,
            alignY: 50,
        });
    };

    const groupByPage = (results: SearchResult[]) => {
        return results.reduce<
            Record<number, { hit: SearchResult; index: number }[]>
        >((map, r, i) => {
            (map[r.pageIndex] ??= []).push({ hit: r, index: i });
            return map;
        }, {});
    };

    const grouped = $derived(groupByPage(search.state.results));

    const isMatchCaseChecked = $derived(
        search.state.flags.includes(MatchFlag.MatchCase),
    );
    const isWholeWordChecked = $derived(
        search.state.flags.includes(MatchFlag.MatchWholeWord),
    );
</script>

<div class="flex h-full flex-col">
    <div class="space-y-3 p-3">
        <div class="relative">
            <SearchIcon class="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
                bind:ref={inputRef}
                bind:value={inputValue}
                type="text"
                placeholder="Search in document"
                class="h-8 pl-8 pr-8 text-sm"
            />
            {#if inputValue}
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onclick={() => {
                        inputValue = "";
                        inputRef?.focus();
                    }}
                    class="absolute right-1.5 top-1/2 -translate-y-1/2"
                >
                    <XIcon class="size-3" />
                </Button>
            {/if}
        </div>

        <div class="flex gap-4">
            <Label class="flex items-center gap-1.5">
                <Checkbox
                    checked={isMatchCaseChecked}
                    onCheckedChange={(checked) =>
                        handleFlagChange(MatchFlag.MatchCase, checked === true)}
                />
                <span class="text-xs text-muted-foreground">Case sensitive</span>
            </Label>
            <Label class="flex items-center gap-1.5">
                <Checkbox
                    checked={isWholeWordChecked}
                    onCheckedChange={(checked) =>
                        handleFlagChange(
                            MatchFlag.MatchWholeWord,
                            checked === true,
                        )}
                />
                <span class="text-xs text-muted-foreground">Whole word</span>
            </Label>
        </div>

        {#if search.state.active && !search.state.loading}
            <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">
                    {search.state.total} result{search.state.total !== 1
                        ? "s"
                        : ""}
                </span>
                {#if search.state.total > 1}
                    <div class="flex gap-0.5">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onclick={() => search.provides?.previousResult()}
                        >
                            <ChevronUpIcon class="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onclick={() => search.provides?.nextResult()}
                        >
                            <ChevronDownIcon class="size-3.5" />
                        </Button>
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    <div class="flex-1 overflow-y-auto px-3 pb-3">
        {#if search.state.loading}
            <div class="flex h-32 items-center justify-center">
                <LoaderCircleIcon class="size-4 animate-spin text-muted-foreground" />
            </div>
        {:else}
            {#each Object.entries(grouped) as [page, hits]}
                <div class="mb-3">
                    <div class="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Page {Number(page) + 1}
                    </div>
                    <div class="space-y-1">
                        {#each hits as { hit, index }}
                            <button
                                onclick={() =>
                                    search.provides?.goToResult(index)}
                                class="w-full rounded-md border px-2.5 py-2 text-left text-xs transition-colors
                                    {index === search.state.activeResultIndex
                                    ? 'border-primary/30 bg-primary/5'
                                    : 'border-border hover:bg-accent'}"
                            >
                                {#if hit.context.truncatedLeft}<span class="text-muted-foreground">... </span>{/if}<span>{hit.context.before}</span><span class="font-semibold text-primary">{hit.context.match}</span><span>{hit.context.after}</span>{#if hit.context.truncatedRight}<span class="text-muted-foreground"> ...</span>{/if}
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
