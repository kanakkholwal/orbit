<script lang="ts">
  import { ChipGroup, OptionGroup, OptionToggle, SegmentedControl } from "$components/tool";
  import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "$components/ui/native-select";
  import { NumberInput } from "$components/ui/number-input";
  import { Slider } from "$components/ui/slider";
  import type { OutputFormat } from "$lib/image/codec";
  import { ASPECTS, getPreset, presetsByGroup, type PresetGroup, type Unit } from "$lib/image/presets";
  import type { ImageStudioState } from "./helper.svelte";

  let { store }: { store: ImageStudioState } = $props();

  const formats: { value: OutputFormat; label: string }[] = [
    { value: "jpeg", label: "JPG" },
    { value: "png", label: "PNG" },
    { value: "webp", label: "WebP" },
  ];
  const units: { value: Unit; label: string }[] = [
    { value: "px", label: "px" },
    { value: "mm", label: "mm" },
    { value: "in", label: "in" },
  ];
  const fits = [
    { value: "cover", label: "Fill" },
    { value: "contain", label: "Fit" },
    { value: "fill", label: "Stretch" },
  ];
  const limitChips = [
    { value: "0", label: "No limit" },
    ...[20, 50, 100, 200, 500, 1024].map((kb) => ({
      value: String(kb),
      label: kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`,
    })),
  ];
  const chipValue = $derived(!store.opts.useLimit ? "0" : limitChips.some((c) => c.value === String(store.opts.maxKB)) ? String(store.opts.maxKB) : "");

  const groups = $derived.by(() => {
    const wanted: PresetGroup[] =
      store.mode === "form" ? ["photo", "signature"] : store.mode === "compress" ? ["limit"] : ["photo", "signature", "social"];
    return presetsByGroup(wanted);
  });
  const preset = $derived(getPreset(store.presetId));
  const pixels = $derived(store.outputPixels);
  const showPresets = $derived(store.mode === "form" || store.mode === "resize");
  const sizeLocked = $derived(store.mode === "resize" && store.opts.lockAspect);

  /** Any option change makes finished results stale. */
  const stale = () => store.items.forEach((i) => store.invalidate(i));
  const customSize = () => {
    store.presetId = undefined;
    store.resetCrops();
    stale();
  };
</script>

<div class="flex flex-col gap-6">
  {#if showPresets}
    <OptionGroup label="Preset" description={preset?.note}>
      <NativeSelect
        aria-label="Preset"
        value={store.presetId ?? ""}
        onchange={(e) => {
          if (e.currentTarget.value) store.selectPreset(e.currentTarget.value);
          stale();
        }}
      >
        <NativeSelectOption value="">Custom</NativeSelectOption>
        {#each groups as g (g.group)}
          <NativeSelectOptGroup label={g.label}>
            {#each g.items as p (p.id)}
              <NativeSelectOption value={p.id}>{p.label}</NativeSelectOption>
            {/each}
          </NativeSelectOptGroup>
        {/each}
      </NativeSelect>
    </OptionGroup>
  {/if}

  {#if store.mode === "crop"}
    <OptionGroup label="Shape">
      <NativeSelect
        aria-label="Crop shape"
        value={store.opts.aspectId}
        onchange={(e) => {
          store.opts.aspectId = e.currentTarget.value;
          store.resetCrops();
        }}
      >
        {#each ASPECTS as a (a.id)}
          <NativeSelectOption value={a.id}>{a.id === "free" ? "Free" : a.label}</NativeSelectOption>
        {/each}
      </NativeSelect>
    </OptionGroup>
  {/if}

  {#if store.mode === "resize" || store.mode === "form"}
    <OptionGroup label="Size" description={pixels ? `${pixels.width} x ${pixels.height} px` : undefined}>
      <div class="flex flex-col gap-3">
        <SegmentedControl name="Unit" options={units} bind:value={store.opts.unit} onchange={customSize} />
        <div class="grid grid-cols-2 gap-3">
          <NumberInput
            label="Width"
            min={0}
            step={store.opts.unit === "px" ? 1 : 0.5}
            suffix={` ${store.opts.unit}`}
            value={store.opts.width || null}
            onValueChange={(v) => {
              store.opts.width = v ?? 0;
              customSize();
            }}
          />
          {#if !sizeLocked}
            <NumberInput
              label="Height"
              min={0}
              step={store.opts.unit === "px" ? 1 : 0.5}
              suffix={` ${store.opts.unit}`}
              value={store.opts.height || null}
              onValueChange={(v) => {
                store.opts.height = v ?? 0;
                customSize();
              }}
            />
          {/if}
        </div>
        {#if store.opts.unit !== "px"}
          <NumberInput
            label="Pixels per inch"
            min={72}
            max={1200}
            step={10}
            value={store.opts.dpi}
            onValueChange={(v) => {
              store.opts.dpi = v ?? 300;
              stale();
            }}
          />
        {/if}
        {#if store.mode === "resize"}
          <OptionToggle label="Keep proportions" description="Set the width, the height follows." bind:checked={store.opts.lockAspect} />
          {#if !store.opts.lockAspect}
            <SegmentedControl name="Fit" options={fits} bind:value={store.opts.fit} onchange={stale} />
          {/if}
        {/if}
      </div>
    </OptionGroup>
  {/if}

  {#if store.mode === "compress"}
    <OptionGroup label="Size limit" description="Quality drops until the file fits.">
      <div class="flex flex-col gap-3">
        <ChipGroup
          name="Size limit"
          options={limitChips}
          value={chipValue}
          onchange={(v) => {
            const kb = Number(v);
            store.opts.useLimit = kb > 0;
            if (kb > 0) store.opts.maxKB = kb;
            store.presetId = kb > 0 ? `under-${kb}kb` : undefined;
            stale();
          }}
        />
        {#if store.opts.useLimit}
          <NumberInput
            label="Custom limit"
            min={1}
            step={10}
            suffix=" KB"
            value={store.opts.maxKB || null}
            onValueChange={(v) => {
              store.opts.maxKB = v ?? 0;
              store.presetId = undefined;
              stale();
            }}
          />
        {/if}
      </div>
    </OptionGroup>
  {/if}

  {#if store.mode === "form"}
    <OptionGroup label="File size limit" description="Forms often reject files that are too big or too small.">
      <div class="flex flex-col gap-3">
        <OptionToggle label="Limit file size" bind:checked={store.opts.useLimit} onchange={stale} />
        {#if store.opts.useLimit}
          <div class="grid grid-cols-2 gap-3">
            <NumberInput
              label="At most"
              min={1}
              step={10}
              suffix=" KB"
              value={store.opts.maxKB || null}
              onValueChange={(v) => {
                store.opts.maxKB = v ?? 0;
                store.presetId = undefined;
                stale();
              }}
            />
            <NumberInput
              label="At least"
              min={0}
              step={5}
              suffix=" KB"
              value={store.opts.minKB || null}
              onValueChange={(v) => {
                store.opts.minKB = v ?? 0;
                stale();
              }}
            />
          </div>
        {/if}
      </div>
    </OptionGroup>
  {/if}

  <OptionGroup label="Format">
    <SegmentedControl name="Format" options={formats} bind:value={store.opts.format} onchange={stale} />
  </OptionGroup>

  {#if !store.opts.useLimit && store.opts.format !== "png"}
    <Slider
      label="Quality"
      min={10}
      max={100}
      showValue
      value={store.opts.quality}
      onValueChange={(v) => {
        store.opts.quality = Array.isArray(v) ? v[0] : v;
        stale();
      }}
    />
  {/if}
</div>
