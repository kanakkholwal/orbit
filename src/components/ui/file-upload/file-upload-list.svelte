<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import { cn } from "$lib/cn.js";
import { fileUpload } from "./variants";
import { fileUploadState } from "./context";

let {
	class: classProp,
	children,
	...rest
}: HTMLAttributes<HTMLUListElement> & { children?: Snippet } = $props();

const ctx = fileUploadState("FileUploadList");
</script>

{#if ctx.files.length}
	<ul data-slot="file-upload-list" class={cn(fileUpload({ size: ctx.size }).list(), classProp)} {...rest}>
		{@render children?.()}
	</ul>
{/if}
