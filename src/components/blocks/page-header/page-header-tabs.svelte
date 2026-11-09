<script lang="ts">
import type { ComponentProps } from "svelte";
import { cn } from "$lib/cn.js";
import TabsList from "$components/ui/tabs/tabs-list.svelte";
import { pageHeader } from "./variants";

let { class: classProp, ...rest }: ComponentProps<typeof TabsList> = $props();

const s = pageHeader();
</script>

<!-- The TabsList under the title; holds TabsTriggers inside a Tabs root. -->
<TabsList {...rest} data-slot="page-header-tabs" class={cn(s.tabs(), s.tabList(), classProp)} />
