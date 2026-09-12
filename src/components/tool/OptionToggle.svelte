<script lang="ts">
  import { Switch } from "$components/ui/switch";
  import { cn } from "$lib/utils";

  let {
    label,
    description,
    checked = $bindable(false),
    disabled = false,
    class: className,
  }: { label: string; description?: string; checked: boolean; disabled?: boolean; class?: string } = $props();

  const id = $props.id();
</script>

<div class={cn("flex items-start justify-between gap-4 py-2.5", className)}>
  <label for={id} class="flex min-w-0 cursor-pointer flex-col gap-0.5">
    <span class="text-body font-medium text-foreground">{label}</span>
    {#if description}
      <span class="text-caption text-muted-foreground">{description}</span>
    {/if}
  </label>
  <Switch {id} bind:checked {disabled} class="mt-0.5" />
</div>
