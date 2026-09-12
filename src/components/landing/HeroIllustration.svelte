<script lang="ts" module>
  type V = [number, number, number];
  type Box = { top: string; left: string; right: string };

  const C = Math.cos(Math.PI / 6);
  const S = 0.5;
  const bounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  function project([x, y, z]: V): [number, number] {
    const sx = (x - y) * C;
    const sy = (x + y) * S - z;
    bounds.minX = Math.min(bounds.minX, sx);
    bounds.maxX = Math.max(bounds.maxX, sx);
    bounds.minY = Math.min(bounds.minY, sy);
    bounds.maxY = Math.max(bounds.maxY, sy);
    return [sx, sy];
  }

  const poly = (vs: V[]) =>
    vs.map((v) => project(v).map((n) => n.toFixed(1)).join(",")).join(" ");

  function box(x: number, y: number, z: number, w: number, d: number, h: number): Box {
    return {
      top: poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]),
      right: poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]),
      left: poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]),
    };
  }

  function ramp(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) {
    const zAt = (x: number) => z0 + ((x - x0) / (x1 - x0)) * (z1 - z0);
    const hatch: string[] = [];
    for (let x = x0 + 5; x < x1 - 2; x += 7) {
      const [ax, ay] = project([x, y0 + 5, zAt(x)]);
      const [bx, by] = project([x, y1 - 5, zAt(x)]);
      hatch.push(`M${ax.toFixed(1)} ${ay.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}`);
    }
    return {
      top: poly([[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]]),
      side: poly([[x0, y1, z0], [x1, y1, z1], [x1, y1, z1 - 7], [x0, y1, z0 - 7]]),
      hatch: hatch.join(""),
    };
  }

  const plane = (z: number) => `matrix(${C} ${S} ${-C} ${S} 0 ${-z})`;

  function delta(from: V, to: V) {
    const [ax, ay] = project(from);
    const [bx, by] = project(to);
    return { x: (bx - ax).toFixed(1), y: (by - ay).toFixed(1) };
  }

  const inputPillar = box(0, 0, 0, 90, 90, 230);
  const inputDoc = box(18, 14, 230, 54, 62, 3);
  const inRamp = ramp(90, 205, 24, 66, 224, 152);
  const platform = box(190, -10, 0, 200, 200, 150);
  const engine = box(235, 30, 150, 110, 110, 46);
  const tile = box(204, 148, 150, 48, 26, 6);
  const slot = box(262, 156, 150, 104, 12, 3);
  const outRamp = ramp(390, 474, 58, 100, 150, 101);
  const outputPillar = box(470, 36, 0, 92, 92, 100);
  const outputDoc = box(489, 52, 100, 54, 60, 3);

  const toPlatform = delta([45, 45, 233], [210, 45, 155]);
  const fromPlatform = delta([380, 82, 153], [516, 82, 103]);

  const [cloudX, cloudY] = project([420, -40, 300]);
  const [dropX, dropY] = project([420, -40, 196]);

  const pad = 24;
  const viewBox = [
    bounds.minX - pad,
    Math.min(bounds.minY, cloudY - 40) - pad,
    bounds.maxX - bounds.minX + pad * 2,
    bounds.maxY - Math.min(bounds.minY, cloudY - 40) + pad * 2,
  ]
    .map((n) => n.toFixed(1))
    .join(" ");
</script>

<svg
  {viewBox}
  class="hero-iso block h-auto max-h-[min(34rem,calc(100svh-14rem))] w-full max-w-xl"
  role="img"
  aria-label="A document moving between blocks on your own device, with the cloud crossed out"
>
  <defs>
    <linearGradient id="hero-fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.55" stop-color="#fff" />
      <stop offset="1" stop-color="#000" />
    </linearGradient>
    <mask id="hero-fade-mask" maskContentUnits="objectBoundingBox">
      <rect width="1" height="1" fill="url(#hero-fade)" />
    </mask>
  </defs>

  <g mask="url(#hero-fade-mask)">
    <g class="solid">
      <polygon class="face-left" points={inputPillar.left} />
      <polygon class="face-right" points={inputPillar.right} />
      <polygon class="face-top" points={inputPillar.top} />
    </g>

    <g class="solid">
      <polygon class="face-left" points={platform.left} />
      <polygon class="face-right" points={platform.right} />
      <polygon class="face-top" points={platform.top} />
    </g>

    <g class="solid">
      <polygon class="face-right" points={inRamp.side} />
      <polygon class="face-top" points={inRamp.top} />
      <path class="hatch" d={inRamp.hatch} />
    </g>

    <g class="solid">
      <polygon class="face-left" points={engine.left} />
      <polygon class="face-right" points={engine.right} />
      <polygon class="face-top" points={engine.top} />
      <g transform={plane(196)} class="decal engine-lock">
        <rect x="272" y="80" width="36" height="28" rx="5" />
        <path d="M280 80V71a10 10 0 0 1 20 0v9" />
        <circle cx="290" cy="94" r="3" />
      </g>
    </g>

    <g class="solid">
      <polygon class="accent-side" points={tile.left} />
      <polygon class="accent-side" points={tile.right} />
      <polygon class="accent-top" points={tile.top} />
      <text transform={plane(156)} x="214" y="165" class="tile-label">LOCAL</text>
    </g>

    <g class="solid">
      <polygon class="face-left" points={slot.left} />
      <polygon class="face-right" points={slot.right} />
      <polygon class="face-top" points={slot.top} />
    </g>

    <g class="solid">
      <polygon class="face-left" points={outputPillar.left} />
      <polygon class="face-right" points={outputPillar.right} />
      <polygon class="face-top" points={outputPillar.top} />
    </g>

    <g class="solid">
      <polygon class="face-right" points={outRamp.side} />
      <polygon class="face-top" points={outRamp.top} />
      <path class="hatch" d={outRamp.hatch} />
    </g>
  </g>

  <g class="solid doc doc-in" style:--dx={`${toPlatform.x}px`} style:--dy={`${toPlatform.y}px`}>
    <polygon class="face-left" points={inputDoc.left} />
    <polygon class="face-right" points={inputDoc.right} />
    <polygon class="face-top" points={inputDoc.top} />
    <g transform={plane(233)} class="decal">
      <path d="M26 24h26M26 34h38M26 42h30M26 50h36M26 58h22" />
    </g>
  </g>

  <g class="solid doc doc-out" style:--dx={`${fromPlatform.x}px`} style:--dy={`${fromPlatform.y}px`}>
    <polygon class="face-left" points={outputDoc.left} />
    <polygon class="face-right" points={outputDoc.right} />
    <polygon class="face-top" points={outputDoc.top} />
    <g transform={plane(103)} class="decal">
      <path d="M497 62h26M497 72h38M497 80h30M497 88h36" />
      <circle class="check-dot" cx="528" cy="100" r="7" />
      <path class="check-mark" d="M524.5 100l2.5 2.5 4.5-5" />
    </g>
  </g>

  <g class="cloud" transform={`translate(${cloudX.toFixed(1)} ${cloudY.toFixed(1)})`}>
    <path
      class="cloud-shape"
      d="M-22 10h44a14 14 0 0 0 0-28 20 20 0 0 0-38-4 14 14 0 0 0-6 32z"
    />
    <path class="cloud-slash" d="M-30-26L30 18" />
  </g>
  <path
    class="drop"
    d={`M${cloudX.toFixed(1)} ${(cloudY + 22).toFixed(1)}V${dropY.toFixed(1)}`}
  />
  <path
    class="drop-x"
    d={`M${(dropX - 5).toFixed(1)} ${(dropY - 5).toFixed(1)}l10 10m0-10l-10 10`}
  />
</svg>

<style>
  .hero-iso {
    --iso-ink: var(--foreground);
    --iso-top: var(--canvas);
    --iso-left: color-mix(in oklch, var(--foreground) 3%, var(--canvas));
    --iso-right: color-mix(in oklch, var(--foreground) 8%, var(--canvas));
    overflow: visible;
  }

  .solid polygon,
  .hatch,
  .decal,
  .cloud-shape,
  .cloud-slash,
  .drop,
  .drop-x {
    stroke: var(--iso-ink);
    stroke-width: 1.25;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }

  .face-top {
    fill: var(--iso-top);
  }
  .face-left {
    fill: var(--iso-left);
  }
  .face-right {
    fill: var(--iso-right);
  }

  .hatch {
    fill: none;
    stroke-width: 1;
  }

  .decal {
    fill: none;
  }

  .accent-top {
    fill: var(--primary);
  }
  .accent-side {
    fill: var(--primary-active);
  }

  .tile-label {
    fill: var(--primary-foreground);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.08em;
  }

  .check-dot {
    fill: var(--primary);
    stroke: none;
  }
  .check-mark {
    stroke: var(--primary-foreground);
    stroke-width: 1.5;
  }

  .cloud-shape {
    fill: var(--iso-top);
  }
  .cloud-slash {
    stroke: var(--iso-ink);
    stroke-width: 1.5;
  }
  .drop {
    fill: none;
    stroke-dasharray: 3 5;
  }
  .drop-x {
    stroke-width: 1.5;
  }

  .doc,
  .check-dot,
  .check-mark {
    transform-box: view-box;
  }

  @media (prefers-reduced-motion: no-preference) {
    .doc-in {
      animation: doc-in 7s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }
    .doc-out {
      animation: doc-out 7s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }
    .engine-lock {
      animation: engine 7s ease-in-out infinite;
    }
  }

  @keyframes doc-in {
    0%,
    8% {
      transform: translate(0, 0);
      opacity: 1;
    }
    36% {
      transform: translate(var(--dx), var(--dy));
      opacity: 1;
    }
    40%,
    90% {
      transform: translate(var(--dx), var(--dy));
      opacity: 0;
    }
    91% {
      transform: translate(0, 0);
      opacity: 0;
    }
    100% {
      transform: translate(0, 0);
      opacity: 1;
    }
  }

  @keyframes doc-out {
    0%,
    52% {
      transform: translate(calc(var(--dx) * -1), calc(var(--dy) * -1));
      opacity: 0;
    }
    56% {
      transform: translate(calc(var(--dx) * -1), calc(var(--dy) * -1));
      opacity: 1;
    }
    82%,
    92% {
      transform: translate(0, 0);
      opacity: 1;
    }
    100% {
      transform: translate(0, 0);
      opacity: 0;
    }
  }

  @keyframes engine {
    0%,
    38%,
    58%,
    100% {
      stroke: var(--iso-ink);
    }
    44%,
    52% {
      stroke: var(--primary);
    }
  }
</style>
