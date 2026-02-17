<script lang="ts">
	import { Button, type ButtonProps } from '$components/ui/button';
	import * as Dialog from '$components/ui/dialog';
	import * as Drawer from '$components/ui/drawer';
	import { useMediaQuery } from '$lib/hooks/use-media-query.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	type Props = {
		// State
		open?: boolean;
		
		// Content
		title: string | Snippet;
		description?: string | Snippet;
		children: Snippet;
		
		btnProps?: ButtonProps;
		
		// Styling & Config
		class?: string;
		showCloseButton?: boolean;
		hideHeader?: boolean;
	};

	let {
		open = $bindable(false),
		title,
		description,
		children,
		btnProps = {},
		class: className,
		showCloseButton = false,
		hideHeader = false
	}: Props = $props();

	// Reactive media query
	const isDesktop = useMediaQuery('(min-width: 768px)');
</script>

{#snippet ContentRender(content: string | Snippet | undefined)}
	{#if typeof content === 'string'}
		{content}
	{:else if content}
		{@render content()}
	{/if}
{/snippet}

{#if isDesktop.value}
	<Dialog.Root bind:open>
		<Dialog.Trigger>
			{#snippet child({ props })}
				<Button {...props} {...btnProps} />
			{/snippet}
		</Dialog.Trigger>
		<Dialog.Content class={cn('sm:max-w-106.25', className)}>
			<Dialog.Header class={cn(hideHeader ? 'hidden' : 'text-left')}>
				<Dialog.Title>
					{@render ContentRender(title)}
				</Dialog.Title>
				{#if description}
					<Dialog.Description>
						{@render ContentRender(description)}
					</Dialog.Description>
				{/if}
			</Dialog.Header>
			
			{@render children()}
			
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root bind:open>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button {...props} {...btnProps} />
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<Drawer.Header class={cn(hideHeader ? 'hidden' : 'text-left')}>
				<Drawer.Title>
					{@render ContentRender(title)}
				</Drawer.Title>
				{#if description}
					<Drawer.Description>
						{@render ContentRender(description)}
					</Drawer.Description>
				{/if}
			</Drawer.Header>
			
			<div class={cn('px-4 w-full space-y-3', className, showCloseButton ? '' : 'pb-4')}>
				{@render children()}
			</div>

			{#if showCloseButton}
				<Drawer.Footer class="pt-2 justify-end">
					<Drawer.Close>
						<Button variant="outline" size="sm" class="w-full">Cancel</Button>
					</Drawer.Close>
				</Drawer.Footer>
			{/if}
		</Drawer.Content>
	</Drawer.Root>
{/if}