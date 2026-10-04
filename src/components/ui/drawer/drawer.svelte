<script lang="ts">
import { Drawer } from "vaul-svelte";
import { type DrawerDirection, setDrawer } from "./context";

// vaul's props are a union keyed on snapPoints/fadeFromIndex, so they pass through whole.
type Props = Drawer.RootProps & { direction?: DrawerDirection };

let {
	children,
	open = $bindable(false),
	direction = "bottom",
	dismissible = true,
	shouldScaleBackground = false,
	...rest
}: Props = $props();

setDrawer({
	get direction() {
		return direction;
	},
});
</script>

<Drawer.Root bind:open {direction} {dismissible} {shouldScaleBackground} {...rest}>
	{@render children?.()}
</Drawer.Root>
