<script lang="ts">
import FieldError from "$components/ui/field/field-error.svelte";
import { rejectionMessage } from "./core";
import { fileUploadState } from "./context";

let { class: classProp }: { class?: string } = $props();

const ctx = fileUploadState("FileUploadError");
</script>

<FieldError
	class={classProp}
	errors={ctx.rejections.map((r) => ({
		message: rejectionMessage(r, ctx.labels, { maxSize: ctx.maxSize, maxFiles: ctx.maxFiles }),
	}))}
/>
