<script lang="ts">
    import * as icons from "$lib/icons";
    import type { IconProps } from "$lib/icons";

    interface Props extends IconProps {
        name: string;
        primaryColor?: string;
        secondaryColor?: string;
        class?: string;
    }

    let { name, primaryColor, secondaryColor, style, ...rest }: Props = $props();

    const pascal = (v: string) => v.replace(/(^|-)([a-z0-9])/g, (_, __, c) => c.toUpperCase());
    const IconComponent = $derived(
        (icons as unknown as Record<string, typeof icons.IconX>)[`IconEd${pascal(name)}`],
    );

    const mergedStyle = $derived.by(() => {
        let s = style || "";
        if (primaryColor) s += `; color: ${primaryColor}`;
        if (secondaryColor) s += `; fill: ${secondaryColor}`;
        return s;
    });
</script>

{#if IconComponent}
    <IconComponent {...rest} style={mergedStyle} />
{:else}
    <span class="text-xs text-destructive" title={`Icon '${name}' not found`}>?</span>
{/if}
