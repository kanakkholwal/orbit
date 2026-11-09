<script lang="ts">
import type { Snippet } from "svelte";
import Accordion from "$components/ui/accordion/accordion.svelte";
import AccordionContent from "$components/ui/accordion/accordion-content.svelte";
import AccordionItem from "$components/ui/accordion/accordion-item.svelte";
import AccordionTrigger from "$components/ui/accordion/accordion-trigger.svelte";
import Badge from "$components/ui/badge/badge.svelte";
import CodeBlock from "$components/ui/code-block/code-block.svelte";
import type { ImageSlotProps } from "$lib/image.js";
import {
	CHANGELOG_KINDS,
	changelogDay,
	changelogMonths,
	kindBadge,
	kindShown,
} from "./changelog";
import { changelogFeedState } from "./context";

let {
	image,
	class: classProp,
}: {
	/** Renders each image, e.g. through your framework's image component; defaults to `<img>`. */
	image?: Snippet<[ImageSlotProps]>;
	class?: string;
} = $props();
const feed = changelogFeedState();
const months = $derived(changelogMonths(feed.entries, feed.locale));
const s = $derived(feed.styles);
</script>

<!-- Entries by month under sticky headings; each opens into its details and media. -->
<div data-slot="changelog-feed-list" class={classProp}>
	{#each months as month (month.key)}
		{@const visible = month.items.some((entry) => kindShown(entry, feed.kinds))}
		<div data-hidden={!visible} inert={!visible} class={s.month()}>
			<div class={s.monthInner()}>
				<h3 class={s.monthLabel()}>{month.label}</h3>
				<Accordion type="multiple" value={feed.open} onValueChange={feed.setOpen} class={s.list()}>
					{#each month.items as entry (entry.id)}
						{@const gone = !kindShown(entry, feed.kinds)}
						<AccordionItem value={entry.id} data-hidden={gone} inert={gone} class={s.row()}>
							<div class={s.rowInner()}>
								<AccordionTrigger class={s.trigger()}>
									<span class={s.triggerBody()}>
										<span class={s.meta()}>
											<time datetime={entry.date}>{changelogDay(entry.date, feed.locale)}</time>
											<span class={s.version()}>v{entry.version}</span>
										</span>
										<span class={s.body()}>
											<span class={s.titleLine()}>
												<Badge variant={kindBadge[entry.kind]} size="sm">
													{CHANGELOG_KINDS.find((k) => k.id === entry.kind)?.label}
												</Badge>
												{entry.title}
											</span>
											<span class={s.summary()}>{entry.summary}</span>
										</span>
									</span>
								</AccordionTrigger>
								<AccordionContent class={s.panel()}>
									{#if entry.details?.length}
										<ul class={s.details()}>
											{#each entry.details as detail (detail)}<li>{detail}</li>{/each}
										</ul>
									{/if}
									{#if entry.media?.type === "photo"}
										<figure class={s.figure()}>
											{#if image}{@render image({ src: entry.media.src, alt: entry.media.alt, className: s.photo(), loading: "lazy" })}{:else}<img src={entry.media.src} alt={entry.media.alt} loading="lazy" decoding="async" class={s.photo()} />{/if}
											{#if entry.media.caption}<figcaption class={s.caption()}>{entry.media.caption}</figcaption>{/if}
										</figure>
									{:else if entry.media?.type === "code"}
										<CodeBlock code={entry.media.code} filename={entry.media.file} language={entry.media.language} />
									{/if}
								</AccordionContent>
							</div>
						</AccordionItem>
					{/each}
				</Accordion>
			</div>
		</div>
	{/each}
</div>
