<script lang="ts">
  import { IconPhotoPlus as PhotoPlus, IconQrcode as Qr } from "@tabler/icons-svelte";
  import { fill } from "../model/fields";
  import { type CreatorTheme, tint, toneColor } from "../model/themes";
  import type { Block, BlockPropsMap, BlockType } from "../model/types";
  import RichText from "./RichText.svelte";

  type Props = {
    block: Block;
    theme: CreatorTheme;
    data: Record<string, string>;
    showValues: boolean;
    readonly: boolean;
    contentWidth: number;
    focusKey: string | null;
    onfocused: () => void;
    update: (patch: Partial<BlockPropsMap[BlockType]>, tag?: string) => void;
    requestFocus: (key: string) => void;
    onslash?: () => void;
  };

  let { block, theme, data, showValues, readonly, contentWidth, focusKey, onfocused, update, requestFocus, onslash }: Props = $props();

  const common = $derived({ data, showValues, readonly, activeFocusKey: focusKey, onfocused });
  const key = (path: string) => `${block.id}:${path}`;
  const c = $derived(theme.colors);

  function replaceAt<T>(list: T[], index: number, value: T): T[] {
    return list.map((item, i) => (i === index ? value : item));
  }

  function editList(items: string[], field: "items") {
    return {
      change: (i: number, value: string) => update({ [field]: replaceAt(items, i, value) } as never, `list:${block.id}`),
      enter: (i: number) => {
        update({ [field]: [...items.slice(0, i + 1), "", ...items.slice(i + 1)] } as never, `list-add:${block.id}`);
        requestFocus(key(`${field}.${i + 1}`));
      },
      removeEmpty: (i: number) => {
        if (items.length <= 1) return;
        update({ [field]: items.filter((_, j) => j !== i) } as never, `list-remove:${block.id}`);
        requestFocus(key(`${field}.${Math.max(0, i - 1)}`));
      },
    };
  }

  const maxOf = (values: number[]) => Math.max(1, ...values.map((v) => Number(v) || 0));

  function linePoints(values: number[], width: number, height: number) {
    const max = maxOf(values);
    const step = values.length > 1 ? width / (values.length - 1) : 0;
    return values.map((v, i) => [i * step, height - ((Number(v) || 0) / max) * height] as const);
  }

  function pieGradient(values: number[]) {
    const total = values.reduce((sum, v) => sum + (Number(v) || 0), 0) || 1;
    const colors = [c.primary, c.accent, tint(c.primary, 0.55), c.info, c.warning, c.success, c.mutedForeground, tint(c.accent, 0.45)];
    let at = 0;
    const stops = values.map((v, i) => {
      const start = at;
      at += ((Number(v) || 0) / total) * 360;
      return `${colors[i % colors.length]} ${start}deg ${at}deg`;
    });
    return { gradient: `conic-gradient(${stops.join(", ")})`, colors };
  }
</script>

{#if block.type === "title"}
  {@const p = block.props}
  <div class="cp-title" style:text-align={p.align}>
    {#if p.eyebrow || !readonly}
      <RichText {...common} value={p.eyebrow} placeholder="Eyebrow" optional class="cp-eyebrow" onchange={(v) => update({ eyebrow: v })} />
    {/if}
    <RichText {...common} value={p.title} placeholder="Title" class="cp-title-text" focusKey={key("title")} onchange={(v) => update({ title: v })} />
    {#if p.subtitle || !readonly}
      <RichText {...common} value={p.subtitle} placeholder="Subtitle" optional multiline class="cp-subtitle" onchange={(v) => update({ subtitle: v })} />
    {/if}
  </div>
{:else if block.type === "heading"}
  {@const p = block.props}
  <RichText
    {...common}
    value={p.text}
    placeholder="Heading"
    rich={false}
    class={`cp-h cp-h${p.level}`}
    style={`text-align:${p.align}`}
    focusKey={key("text")}
    onchange={(v) => update({ text: v })}
  />
{:else if block.type === "paragraph"}
  {@const p = block.props}
  <RichText
    {...common}
    value={p.text}
    placeholder="Type / for blocks"
    multiline
    class={`cp-p cp-p-${p.size}`}
    style={`text-align:${p.align};${p.muted ? `color:${c.mutedForeground}` : ""}`}
    focusKey={key("text")}
    onslash={onslash}
    onchange={(v) => update({ text: v })}
  />
{:else if block.type === "quote"}
  {@const p = block.props}
  <div class="cp-quote">
    <RichText {...common} value={p.text} placeholder="Quote" multiline class="cp-quote-text" focusKey={key("text")} onchange={(v) => update({ text: v })} />
    {#if p.cite || !readonly}
      <RichText {...common} value={p.cite} placeholder="Attribution" optional class="cp-small cp-muted" onchange={(v) => update({ cite: v })} />
    {/if}
  </div>
{:else if block.type === "bullets" || block.type === "numbered"}
  {@const items = block.props.items}
  {@const edit = editList(items, "items")}
  <svelte:element this={block.type === "numbered" ? "ol" : "ul"} class="cp-list" class:cp-ol={block.type === "numbered"}>
    {#each items as item, i (i)}
      <li>
        <RichText
          {...common}
          value={item}
          placeholder="List item"
          focusKey={key(`items.${i}`)}
          onchange={(v) => edit.change(i, v)}
          onenter={() => edit.enter(i)}
          onbackspaceempty={() => edit.removeEmpty(i)}
        />
      </li>
    {/each}
  </svelte:element>
{:else if block.type === "checklist"}
  {@const items = block.props.items}
  <div class="cp-checklist">
    {#each items as item, i (i)}
      <div class="cp-check-row" class:cp-done={item.done}>
        {#if readonly}
          <span class="cp-box" aria-hidden="true"></span>
        {:else}
          <button
            type="button"
            class="cp-box"
            aria-label={item.done ? "Mark as not done" : "Mark as done"}
            aria-pressed={item.done}
            onclick={(e) => {
              e.stopPropagation();
              update({ items: replaceAt(items, i, { ...item, done: !item.done }) }, `check:${block.id}`);
            }}
          ></button>
        {/if}
        <RichText
          {...common}
          value={item.text}
          placeholder="Task"
          focusKey={key(`items.${i}`)}
          onchange={(v) => update({ items: replaceAt(items, i, { ...item, text: v }) }, `list:${block.id}`)}
          onenter={() => {
            update({ items: [...items.slice(0, i + 1), { text: "", done: false }, ...items.slice(i + 1)] }, `list-add:${block.id}`);
            requestFocus(key(`items.${i + 1}`));
          }}
          onbackspaceempty={() => {
            if (items.length <= 1) return;
            update({ items: items.filter((_, j) => j !== i) }, `list-remove:${block.id}`);
            requestFocus(key(`items.${Math.max(0, i - 1)}`));
          }}
        />
      </div>
    {/each}
  </div>
{:else if block.type === "code"}
  <div class="cp-code"><RichText {...common} value={block.props.code} rich={false} multiline placeholder="Code" onchange={(v) => update({ code: v })} /></div>
{:else if block.type === "finePrint"}
  <RichText {...common} value={block.props.text} multiline placeholder="Fine print" class="cp-fine" onchange={(v) => update({ text: v })} />
{:else if block.type === "divider"}
  {@const p = block.props}
  <div
    class="cp-divider"
    style:border-top={`${p.variant === "accent" ? 2 : 0.75}px ${p.variant === "dashed" ? "dashed" : "solid"} ${p.variant === "accent" ? c.primary : c.border}`}
    style:width={p.variant === "accent" ? "48px" : "100%"}
  ></div>
{:else if block.type === "spacer"}
  <div class="cp-spacer" style:height={`${block.props.size}px`}><span>{block.props.size} pt</span></div>
{:else if block.type === "pageBreak"}
  <div class="cp-break"><span>Page break</span></div>
{:else if block.type === "columns"}
  {@const p = block.props}
  {@const [l, r] = p.ratio === "2:1" ? [2, 1] : p.ratio === "1:2" ? [1, 2] : [1, 1]}
  <div class="cp-columns">
    <RichText {...common} value={p.left} multiline placeholder="Left column" style={`flex:${l}`} onchange={(v) => update({ left: v })} />
    <RichText {...common} value={p.right} multiline placeholder="Right column" style={`flex:${r}`} onchange={(v) => update({ right: v })} />
  </div>
{:else if block.type === "card"}
  {@const p = block.props}
  <div
    class="cp-card"
    style:background={p.variant === "muted" ? c.muted : p.variant === "accent" ? tint(c.primary, 0.08) : "transparent"}
    style:border={p.variant === "outline" ? `0.75px solid ${c.border}` : "none"}
    style:border-left={p.variant === "accent" ? `3px solid ${c.primary}` : undefined}
  >
    <RichText {...common} value={p.title} placeholder="Card title" class="cp-card-title" focusKey={key("title")} onchange={(v) => update({ title: v })} />
    <RichText {...common} value={p.body} multiline placeholder="Card text" onchange={(v) => update({ body: v })} />
  </div>
{:else if block.type === "callout"}
  {@const p = block.props}
  {@const tone = toneColor(theme, p.tone)}
  <div class="cp-card" style:background={tint(tone, 0.08)} style:border-left={`3px solid ${tone}`}>
    <RichText {...common} value={p.title} placeholder="Callout title" class="cp-strong" style={`color:${tone}`} focusKey={key("title")} onchange={(v) => update({ title: v })} />
    <RichText {...common} value={p.body} multiline placeholder="Callout text" onchange={(v) => update({ body: v })} />
  </div>
{:else if block.type === "letterhead"}
  {@const p = block.props}
  <div class="cp-letterhead">
    <div class="cp-row cp-center" style="gap:10px">
      {#if p.logo}<img src={p.logo} alt="" style="height:36px;width:auto" />{/if}
      <div>
        <RichText {...common} value={p.brand} placeholder="Company name" class="cp-brand" focusKey={key("brand")} onchange={(v) => update({ brand: v })} />
        <RichText {...common} value={p.tagline} placeholder="Tagline" optional class="cp-small cp-muted" onchange={(v) => update({ tagline: v })} />
      </div>
    </div>
    <RichText {...common} value={p.details} multiline placeholder="Contact details" class="cp-small cp-muted" style="text-align:right;white-space:pre-line;line-height:1.45" onchange={(v) => update({ details: v })} />
  </div>
{:else if block.type === "addresses"}
  {@const p = block.props}
  <div class="cp-columns" style="gap:24px">
    <div style="flex:1">
      <RichText {...common} value={p.fromLabel} placeholder="Label" class="cp-label" onchange={(v) => update({ fromLabel: v })} />
      <RichText {...common} value={p.from} multiline placeholder="Name and address" class="cp-pre" onchange={(v) => update({ from: v })} />
    </div>
    <div style="flex:1">
      <RichText {...common} value={p.toLabel} placeholder="Label" class="cp-label" onchange={(v) => update({ toLabel: v })} />
      <RichText {...common} value={p.to} multiline placeholder="Name and address" class="cp-pre" onchange={(v) => update({ to: v })} />
    </div>
  </div>
{:else if block.type === "table"}
  {@const p = block.props}
  {@const weights = p.columns.map((_, i) => (i === 0 && p.columns.length > 2 ? 2 : 1))}
  <table class="cp-table">
    <colgroup>
      {#each weights as w, i (i)}<col style:width={`${(w / weights.reduce((a, x) => a + x, 0)) * 100}%`} />{/each}
    </colgroup>
    <thead>
      <tr>
        {#each p.columns as column, i (i)}
          <th style:text-align={p.numericLast && i > 0 ? "right" : "left"}>
            <RichText {...common} value={column} placeholder="Column" onchange={(v) => update({ columns: replaceAt(p.columns, i, v) }, `table:${block.id}`)} />
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each p.rows as row, r (r)}
        <tr style:background={p.striped && r % 2 === 1 ? c.muted : undefined}>
          {#each p.columns as _, i (i)}
            <td style:text-align={p.numericLast && i > 0 ? "right" : "left"}>
              <RichText
                {...common}
                value={row[i] ?? ""}
                placeholder=" "
                onchange={(v) => update({ rows: replaceAt(p.rows, r, replaceAt(p.columns.map((_, j) => row[j] ?? ""), i, v)) }, `table:${block.id}`)}
              />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{:else if block.type === "keyValue"}
  {@const p = block.props}
  <div class="cp-kv" class:cp-kv-2={p.columns === 2}>
    {#each p.items as item, i (i)}
      <div class="cp-kv-row">
        <RichText {...common} value={item.label} placeholder="Label" class="cp-muted" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, label: v }) }, `kv:${block.id}`)} />
        <RichText {...common} value={item.value} placeholder="Value" class="cp-strong" style="text-align:right" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, value: v }) }, `kv:${block.id}`)} />
      </div>
    {/each}
  </div>
{:else if block.type === "totals"}
  {@const p = block.props}
  <div class="cp-totals">
    <div style="width:220px">
      {#each p.items as item, i (i)}
        <div class="cp-row cp-between cp-tight">
          <RichText {...common} value={item.label} placeholder="Label" class="cp-muted" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, label: v }) }, `totals:${block.id}`)} />
          <RichText {...common} value={item.value} placeholder="0" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, value: v }) }, `totals:${block.id}`)} />
        </div>
      {/each}
      <div class="cp-row cp-between cp-total" style:border-top={`1px solid ${c.foreground}`}>
        <RichText {...common} value={p.totalLabel} placeholder="Total" onchange={(v) => update({ totalLabel: v })} />
        <RichText {...common} value={p.total} placeholder="0" onchange={(v) => update({ total: v })} />
      </div>
    </div>
  </div>
{:else if block.type === "signature"}
  {@const p = block.props}
  <div class="cp-row" style="gap:32px">
    {#each p.parties as party, i (i)}
      <div style="flex:1">
        {#if i === 0 && p.image}
          <img src={p.image} alt="Signature" style="height:40px;width:auto;display:block;margin-bottom:2px" />
        {:else}
          <div style="height:42px"></div>
        {/if}
        <div style:border-top={`0.75px solid ${c.foreground}`} style="padding-top:5px">
          <RichText {...common} value={party.name} placeholder="Name" class="cp-strong" onchange={(v) => update({ parties: replaceAt(p.parties, i, { ...party, name: v }) }, `sig:${block.id}`)} />
          <RichText {...common} value={party.role} placeholder="Role" optional class="cp-small cp-muted" onchange={(v) => update({ parties: replaceAt(p.parties, i, { ...party, role: v }) }, `sig:${block.id}`)} />
          {#if p.showDate}<div class="cp-small cp-muted" style="margin-top:12px">Date</div>{/if}
        </div>
      </div>
    {/each}
  </div>
{:else if block.type === "stats"}
  {@const p = block.props}
  <div class="cp-row" style="gap:10px">
    {#each p.items as item, i (i)}
      <div class="cp-stat" style:background={c.muted}>
        <RichText {...common} value={item.label} placeholder="Label" class="cp-label" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, label: v }) }, `stats:${block.id}`)} />
        <RichText {...common} value={item.value} placeholder="Value" class="cp-stat-value" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, value: v }) }, `stats:${block.id}`)} />
        <RichText {...common} value={item.note} placeholder="Note" optional class="cp-small" style={`color:${c.primary}`} onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, note: v }) }, `stats:${block.id}`)} />
      </div>
    {/each}
  </div>
{:else if block.type === "progress"}
  <div>
    {#each block.props.items as item, i (i)}
      {@const value = Math.max(0, Math.min(100, Number(item.value) || 0))}
      <div style="margin-bottom:8px">
        <div class="cp-row cp-between" style="margin-bottom:3px">
          <span>{fill(item.label, showValues ? data : {})}</span><span class="cp-small cp-muted">{value}%</span>
        </div>
        <div class="cp-track" style:background={c.muted}><div style:width={`${value}%`} style:background={c.primary}></div></div>
      </div>
    {/each}
  </div>
{:else if block.type === "barChart"}
  {@const p = block.props}
  {@const max = maxOf(p.data.map((d) => d.value))}
  <div>
    {#if p.title}<div class="cp-strong" style="margin-bottom:6px">{p.title}</div>{/if}
    <div class="cp-bars">
      {#each p.data as d, i (i)}
        <div class="cp-bar-col">
          {#if p.showValues}<span class="cp-tiny">{d.value}</span>{/if}
          <div class="cp-bar" style:height={`${((Number(d.value) || 0) / max) * 100}%`} style:background={c.primary}></div>
        </div>
      {/each}
    </div>
    <div class="cp-bar-labels">{#each p.data as d, i (i)}<span>{d.label}</span>{/each}</div>
  </div>
{:else if block.type === "lineChart"}
  {@const p = block.props}
  {@const w = contentWidth - 16}
  {@const points = linePoints(p.data.map((d) => d.value), w - 12, 140)}
  <div>
    {#if p.title}<div class="cp-strong" style="margin-bottom:6px">{p.title}</div>{/if}
    <svg width="100%" viewBox={`-6 -6 ${w} 152`} style="display:block;overflow:visible" aria-hidden="true">
      {#each [0, 0.25, 0.5, 0.75, 1] as g (g)}<line x1="0" x2={w - 12} y1={140 * g} y2={140 * g} stroke={c.border} stroke-width="0.75" />{/each}
      <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={c.primary} stroke-width="2.5" stroke-linejoin="round" />
      {#each points as [x, y], i (i)}<circle cx={x} cy={y} r="3.5" fill={c.primary} />{/each}
    </svg>
    <div class="cp-bar-labels" style="justify-content:space-between">{#each p.data as d, i (i)}<span style="flex:none">{d.label}</span>{/each}</div>
  </div>
{:else if block.type === "pieChart"}
  {@const p = block.props}
  {@const pie = pieGradient(p.data.map((d) => d.value))}
  <div>
    {#if p.title}<div class="cp-strong" style="margin-bottom:6px">{p.title}</div>{/if}
    <div class="cp-row" style="gap:40px;align-items:flex-start;padding-left:60px">
      <div class="cp-pie" style:background={pie.gradient}>{#if p.donut}<div></div>{/if}</div>
      <div class="cp-legend">
        {#each p.data as d, i (i)}
          <div class="cp-row cp-center" style="gap:6px"><span style:background={pie.colors[i % pie.colors.length]}></span>{d.label}</div>
        {/each}
      </div>
    </div>
  </div>
{:else if block.type === "timeline"}
  {@const p = block.props}
  <div>
    {#each p.items as item, i (i)}
      <div class="cp-row" style="gap:12px">
        <RichText {...common} value={item.date} placeholder="Date" class="cp-small cp-strong cp-muted" style="width:72px;flex:none" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, date: v }) }, `tl:${block.id}`)} />
        <div class="cp-tl-rail">
          <span style:background={c.primary}></span>
          {#if i < p.items.length - 1}<i style:background={c.border}></i>{/if}
        </div>
        <div style="flex:1;padding-bottom:12px">
          <RichText {...common} value={item.title} placeholder="Milestone" class="cp-strong" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, title: v }) }, `tl:${block.id}`)} />
          <RichText {...common} value={item.body} placeholder="Details" optional class="cp-muted" onchange={(v) => update({ items: replaceAt(p.items, i, { ...item, body: v }) }, `tl:${block.id}`)} />
        </div>
      </div>
    {/each}
  </div>
{:else if block.type === "badges"}
  {@const p = block.props}
  {@const edit = editList(p.items, "items")}
  <div class="cp-row" style="gap:6px;flex-wrap:wrap">
    {#each p.items as item, i (i)}
      <span
        class="cp-badge"
        style:background={p.variant === "solid" ? c.primary : p.variant === "soft" ? tint(c.primary, 0.12) : "transparent"}
        style:border={p.variant === "outline" ? `0.75px solid ${c.primary}` : "0.75px solid transparent"}
        style:color={p.variant === "solid" ? "#ffffff" : c.primary}
      >
        <RichText
          {...common}
          value={item}
          placeholder="Tag"
          focusKey={key(`items.${i}`)}
          onchange={(v) => edit.change(i, v)}
          onenter={() => edit.enter(i)}
          onbackspaceempty={() => edit.removeEmpty(i)}
        />
      </span>
    {/each}
  </div>
{:else if block.type === "image"}
  {@const p = block.props}
  {@const width = Math.round(contentWidth * (p.width === "full" ? 1 : p.width === "half" ? 0.5 : 1 / 3))}
  <div class="cp-col" style:align-items={p.align === "center" ? "center" : p.align === "right" ? "flex-end" : "flex-start"}>
    {#if p.src}
      <img src={p.src} alt={p.alt} style:width={`${width}px`} style:border-radius={`${theme.radius}px`} style="display:block;height:auto" />
    {:else}
      <div class="cp-placeholder" style:width={`${width}px`}>
        <PhotoPlus size={22} stroke={1.5} />
        <span>Choose an image in the panel</span>
      </div>
    {/if}
    {#if p.caption}<div class="cp-tiny cp-muted" style:width={`${width}px`} style:text-align={p.align} style="margin-top:4px">{p.caption}</div>{/if}
  </div>
{:else if block.type === "qr"}
  {@const p = block.props}
  <div class="cp-col" style:align-items={p.align === "center" ? "center" : p.align === "right" ? "flex-end" : "flex-start"}>
    <div class="cp-qr" style:width={`${p.size}px`} style:height={`${p.size}px`} title={p.data}>
      <Qr size={p.size * 0.9} stroke={1.25} />
    </div>
    {#if p.caption}<div class="cp-tiny cp-muted" style="margin-top:4px">{p.caption}</div>{/if}
  </div>
{:else if block.type === "barcode"}
  {@const p = block.props}
  <div>
    <div class="cp-barcode" title={p.data}></div>
    {#if p.caption}<div class="cp-tiny cp-muted cp-mono" style="margin-top:4px">{fill(p.caption, showValues ? data : {})}</div>{/if}
  </div>
{/if}
