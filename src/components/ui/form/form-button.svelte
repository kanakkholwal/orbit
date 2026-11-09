<script lang="ts">
import { useSelector } from "@tanstack/svelte-form";
import type { ComponentProps } from "svelte";
import Button from "$components/ui/button/button.svelte";
import { getForm } from "./context";

let {
	ref = $bindable(null),
	loading = false,
	...rest
}: ComponentProps<typeof Button> = $props();

const submitting = useSelector(getForm().form.store, (state) => state.isSubmitting);
</script>

<Button bind:ref type="submit" loading={loading || submitting.current} {...rest} />
