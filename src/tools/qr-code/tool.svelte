<script lang="ts">
  import { OptionGroup, SegmentedControl, ToolPanel } from "$components/tool";
  import { Button } from "$components/ui/button";
  import { Input } from "$components/ui/input";
  import { Textarea } from "$components/ui/textarea";
  import { IconDownload as Download } from "$lib/icons";

  type Kind = "text" | "wifi";
  let kind = $state<Kind>("text");
  let text = $state("https://");
  let ssid = $state("");
  let password = $state("");
  let security = $state<"WPA" | "WEP" | "nopass">("WPA");
  let level = $state<"L" | "M" | "Q" | "H">("M");
  let dark = $state("#000000");
  let light = $state("#ffffff");

  const esc = (v: string) => v.replace(/([\\;,:"])/g, "\\$1");
  const payload = $derived(
    kind === "wifi" ? (ssid ? `WIFI:T:${security};S:${esc(ssid)};P:${esc(password)};;` : "") : text.trim()
  );

  let png = $state("");
  let svg = $state("");
  let failed = $state("");

  $effect(() => {
    const data = payload;
    const opts = { errorCorrectionLevel: level, margin: 2, color: { dark, light } } as const;
    if (!data) {
      png = svg = failed = "";
      return;
    }
    let live = true;
    void import("qrcode").then(async (QR) => {
      try {
        const [url, vector] = await Promise.all([QR.toDataURL(data, { ...opts, width: 1024 }), QR.toString(data, { ...opts, type: "svg" })]);
        if (!live) return;
        png = url;
        svg = vector;
        failed = "";
      } catch {
        if (live) failed = "This is too long for a QR code. Shorten it or lower the error correction.";
      }
    });
    return () => (live = false);
  });

  function save(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    a.click();
  }

  function saveSvg() {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    save(url, "qr-code.svg");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
</script>

<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
  <ToolPanel title="Content">
    <div class="flex flex-col gap-5">
      <SegmentedControl
        name="QR content"
        size="sm"
        options={[
          { value: "text", label: "Text or link" },
          { value: "wifi", label: "Wi-Fi" },
        ]}
        value={kind}
        onchange={(v) => (kind = v as Kind)}
      />
      {#if kind === "text"}
        <Textarea bind:value={text} rows={5} aria-label="Text or link for the QR code" placeholder="https://example.com" />
      {:else}
        <OptionGroup label="Network name">
          <Input bind:value={ssid} aria-label="Network name" autocomplete="off" />
        </OptionGroup>
        <OptionGroup label="Password">
          <Input bind:value={password} aria-label="Wi-Fi password" autocomplete="off" disabled={security === "nopass"} />
        </OptionGroup>
        <OptionGroup label="Security">
          <SegmentedControl
            name="Security"
            size="sm"
            options={[
              { value: "WPA", label: "WPA/WPA2" },
              { value: "WEP", label: "WEP" },
              { value: "nopass", label: "None" },
            ]}
            value={security}
            onchange={(v) => (security = v as typeof security)}
          />
        </OptionGroup>
      {/if}

      <OptionGroup label="Error correction" description="Higher survives more damage but makes a denser code.">
        <SegmentedControl
          name="Error correction"
          size="sm"
          options={[
            { value: "L", label: "Low" },
            { value: "M", label: "Medium" },
            { value: "Q", label: "Quartile" },
            { value: "H", label: "High" },
          ]}
          value={level}
          onchange={(v) => (level = v as typeof level)}
        />
      </OptionGroup>

      <div class="grid grid-cols-2 gap-3">
        <OptionGroup label="Dots">
          <input type="color" aria-label="Dot colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={dark} />
        </OptionGroup>
        <OptionGroup label="Background">
          <input type="color" aria-label="Background colour" class="h-11 w-full cursor-pointer rounded-lg border border-border bg-transparent p-1" bind:value={light} />
        </OptionGroup>
      </div>
    </div>
  </ToolPanel>

  <ToolPanel title="Your QR code">
    <div class="flex flex-col items-center gap-4">
      {#if png}
        <img src={png} alt="QR code preview" class="aspect-square w-full max-w-64 rounded-lg border border-border" />
        <div class="flex flex-wrap justify-center gap-2">
          <Button onclick={() => save(png, "qr-code.png")}>
            <Download />
            PNG
          </Button>
          <Button variant="outline" onclick={saveSvg}>
            <Download />
            SVG
          </Button>
        </div>
      {:else if failed}
        <p role="alert" class="text-sm text-destructive-strong">{failed}</p>
      {:else}
        <p class="py-10 text-center text-sm text-muted-foreground">Type something and the code appears here.</p>
      {/if}
    </div>
  </ToolPanel>
</div>
