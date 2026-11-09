<script lang="ts">
import type { AnyFormApi } from "@tanstack/svelte-form";
import type { HTMLFormAttributes } from "svelte/elements";
import { setForm } from "./context";

let {
	ref = $bindable(null),
	form,
	onsubmit,
	children,
	...rest
}: HTMLFormAttributes & {
	ref?: HTMLFormElement | null;
	form: AnyFormApi;
} = $props();

setForm({
	get form() {
		return form;
	},
});

function submit(event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
	event.preventDefault();
	event.stopPropagation();
	onsubmit?.(event);
	void form.handleSubmit();
}
</script>

<form bind:this={ref} data-slot="form" onsubmit={submit} {...rest}>
	{@render children?.()}
</form>
