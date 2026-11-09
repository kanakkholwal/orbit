<script lang="ts">
import type { Snippet } from "svelte";
import { tick } from "svelte";
import Avatar from "$components/ui/avatar/avatar.svelte";
import AvatarFallback from "$components/ui/avatar/avatar-fallback.svelte";
import AvatarImage from "$components/ui/avatar/avatar-image.svelte";
import Button from "$components/ui/button/button.svelte";
import { cn } from "$lib/cn.js";
import type { ImageSlotProps } from "$lib/image.js";
import Pagination from "$components/ui/pagination/pagination.svelte";
import PaginationContent from "$components/ui/pagination/pagination-content.svelte";
import PaginationItem from "$components/ui/pagination/pagination-item.svelte";
import PaginationLink from "$components/ui/pagination/pagination-link.svelte";
import PaginationNext from "$components/ui/pagination/pagination-next.svelte";
import PaginationPrevious from "$components/ui/pagination/pagination-previous.svelte";
import ToggleGroup from "$components/ui/toggle-group/toggle-group.svelte";
import ToggleGroupItem from "$components/ui/toggle-group/toggle-group-item.svelte";
import {
	ALL,
	type BlogAuthor,
	type BlogPost,
	blogPage,
	easeHeight,
	formatPostDate,
	withViewTransition,
} from "./posts";
import { type BlogGridVariant, blogGrid } from "./variants";

let {
	posts,
	variant = "featured",
	title = "Journal",
	description,
	categories,
	category = $bindable(),
	onCategoryChange,
	page = $bindable(),
	onPageChange,
	pageSize = 6,
	getHref,
	openPost = $bindable(),
	onOpenPostChange,
	locale,
	image,
	class: className,
}: {
	posts: BlogPost[];
	/** `featured` leads page one with a wide card; `grid` keeps every card equal. */
	variant?: BlogGridVariant;
	title?: string;
	description?: string;
	/** Filter labels in order; "All" comes first. */
	categories?: string[];
	/** Active category, or "All". Bindable. */
	category?: string;
	onCategoryChange?: (category: string) => void;
	/** One-based page. Bindable. */
	page?: number;
	onPageChange?: (page: number) => void;
	/** Cards per page below the featured post. */
	pageSize?: number;
	/** Link per post; cards become links and the in-place reader is off. */
	getHref?: (post: BlogPost) => string;
	/** The post open in the in-place reader, by id. Bindable. */
	openPost?: string | null;
	onOpenPostChange?: (id: string | null) => void;
	locale?: string;
	/** Renders each image, e.g. through your framework's image component; defaults to `<img>`. */
	image?: Snippet<[ImageSlotProps]>;
	class?: string;
} = $props();

const uid = $props.id();
const s = $derived(blogGrid({ variant }));
let root = $state<HTMLElement | null>(null);
let frame = $state<HTMLDivElement | null>(null);
let ownCategory = $state(ALL);
let ownPage = $state(1);
let ownOpen = $state<string | null>(null);
let dir = $state(0);
const active = $derived(category ?? ownCategory);
const openId = $derived(openPost !== undefined ? openPost : ownOpen);
const view = $derived(
	blogPage(posts, active, page ?? ownPage, pageSize, variant === "featured"),
);
const reading = $derived(openId ? posts.find((post) => post.id === openId) : undefined);
const tabs = $derived([
	ALL,
	...(categories ?? [...new Set(posts.map((post) => post.category))]),
]);
const pageKey = $derived(`${active}-${view.page}`);

async function settleAfter(finish: () => void) {
	await tick();
	finish();
}
function setCategory(next: string | string[]) {
	const picked = Array.isArray(next) ? next[0] : next;
	if (!picked || picked === active) return;
	const finish = easeHeight(frame);
	dir = 0;
	if (category === undefined) ownCategory = picked;
	else category = picked;
	onCategoryChange?.(picked);
	if (page === undefined) ownPage = 1;
	else page = 1;
	onPageChange?.(1);
	void settleAfter(finish);
}
function setPage(next: number) {
	if (next === view.page || next < 1 || next > view.pageCount) return;
	const finish = easeHeight(frame);
	dir = next > view.page ? 1 : -1;
	if (page === undefined) ownPage = next;
	else page = next;
	onPageChange?.(next);
	void settleAfter(finish);
	if ((root?.getBoundingClientRect().top ?? 0) < 0)
		root?.scrollIntoView({ block: "start" });
}
function setOpen(id: string | null) {
	withViewTransition(async () => {
		const from = openId;
		if (openPost === undefined) ownOpen = id;
		else openPost = id;
		onOpenPostChange?.(id);
		await tick();
		// Closing returns focus to the card the reader came from.
		if (!id && from)
			root
				?.querySelector<HTMLElement>(`[data-post="${from}"]`)
				?.focus({ preventScroll: true });
	});
}
function open(post: BlogPost, event: MouseEvent) {
	if (getHref) return;
	event.preventDefault();
	setOpen(post.id);
}
const imageName = (post: BlogPost) =>
	`blog-${uid}-${post.id}`.replace(/[^a-zA-Z0-9_-]/g, "");
</script>

{#snippet byline(author: BlogAuthor, readTime: number)}
	<div class={s.byline()}>
		<Avatar size="sm" class="size-6">
			{#if author.avatar}<AvatarImage src={author.avatar} alt="" />{/if}
			<AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
		</Avatar>
		<span class={s.author()}>{author.name}</span>
		<span class={s.readTime()}>{readTime} min read</span>
	</div>
{/snippet}

{#snippet meta(post: BlogPost)}
	<p class={s.meta()}>
		<span>{post.category}</span>
		<span aria-hidden="true">·</span>
		<time datetime={post.date}>{formatPostDate(post.date, locale)}</time>
	</p>
{/snippet}

{#snippet card(post: BlogPost, featured: boolean)}
	<a
		href={getHref?.(post) ?? `#${post.id}`}
		data-post={post.id}
		onclick={(event) => open(post, event)}
		class={cn(s.card(), featured && s.featuredCard())}
	>
		{#if post.image}
			<div class={s.imageFrame()} style:view-transition-name={imageName(post)}>
				{#if image}{@render image({ src: post.image.src, alt: post.image.alt, className: s.image(), loading: featured ? "eager" : "lazy" })}{:else}<img src={post.image.src} alt={post.image.alt} loading={featured ? "eager" : "lazy"} decoding="async" class={s.image()} />{/if}
			</div>
		{/if}
		<div class={s.body()}>
			{@render meta(post)}
			<h3 class={cn(s.cardTitle(), featured && s.featuredTitle())}>{post.title}</h3>
			<p class={cn(s.excerpt(), featured && s.featuredExcerpt())}>{post.excerpt}</p>
			{@render byline(post.author, post.readTime)}
		</div>
	</a>
{/snippet}

<section
	bind:this={root}
	data-slot="blog-grid"
	data-variant={variant}
	aria-labelledby={reading ? `${uid}-reader` : `${uid}-title`}
	class={cn(s.root(), className)}
>
	<div class={s.inner()}>
		{#if reading}
			<article class={s.reader()} aria-labelledby="{uid}-reader">
				<!-- svelte-ignore a11y_autofocus -->
				<Button variant="ghost" size="sm" class={s.back()} autofocus onclick={() => setOpen(null)}>
					<svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
						<path d="M13 8H3m4-4L3 8l4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					All posts
				</Button>
				<header class={s.body()}>
					{@render meta(reading)}
					<h2 id="{uid}-reader" class={s.readerTitle()}>{reading.title}</h2>
					{@render byline(reading.author, reading.readTime)}
				</header>
				{#if reading.image}
					<div class={s.readerImage()} style:view-transition-name={imageName(reading)}>
						{#if image}{@render image({ src: reading.image.src, alt: reading.image.alt, className: "size-full object-cover" })}{:else}<img src={reading.image.src} alt={reading.image.alt} decoding="async" class="size-full object-cover" />{/if}
					</div>
				{/if}
				<div class={s.readerBody()}>
					<p>{reading.excerpt}</p>
					{#each reading.body ?? [] as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}
				</div>
			</article>
		{:else}
			<header class={s.header()}>
				<h2 id="{uid}-title" class={s.title()}>{title}</h2>
				{#if description}<p class={s.description()}>{description}</p>{/if}
			</header>
			<div class={s.filters()}>
				<ToggleGroup variant="segmented" label="Filter by category" value={active} onValueChange={setCategory}>
					{#each tabs as tab (tab)}
						<ToggleGroupItem value={tab}>{tab}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>
			<div bind:this={frame} class={s.frame()}>
				<div>
					{#key pageKey}
						<div class={s.page()} style:--dir={dir}>
							{#if view.featured}{@render card(view.featured, true)}{/if}
							{#if view.posts.length}
								<div class={s.grid()}>
									{#each view.posts as post (post.id)}{@render card(post, false)}{/each}
								</div>
							{/if}
							{#if view.filtered.length === 0}
								<p class={s.empty()}>No posts in {active} yet.</p>
							{/if}
						</div>
					{/key}
					{#if view.pageCount > 1}
						<Pagination class={s.pagination()}>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious disabled={view.page === 1} onclick={() => setPage(view.page - 1)} />
								</PaginationItem>
								{#each Array.from({ length: view.pageCount }, (_, index) => index + 1) as number (number)}
									<PaginationItem>
										<PaginationLink active={number === view.page} aria-label="Page {number}" onclick={() => setPage(number)}>
											{number}
										</PaginationLink>
									</PaginationItem>
								{/each}
								<PaginationItem>
									<PaginationNext disabled={view.page === view.pageCount} onclick={() => setPage(view.page + 1)} />
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>
