<script>
  export let size = 90;

  export let debug = false;

  /** @type {number} */
  export let leg = 5;
  /** @type {number} */
  export let body = 2;
  /** @type {number} */
  export let stroke = 2;
  /** @type {number} */
  export let offset = 0.99;
  /** @type {number} */
  export let rotation = -32;
  /** @type {number} */
  export let track = 4;

  $: length = leg + body + Math.PI * track;

  $: clip = [
    `M${body / 2},-3`,
    `A${3 + track / 2},${3 + track / 2} 0,0,1 ${3 + (track + body) / 2},${
      track / 2
    }`,
    `h${stroke / 2 - 3}`,
    `A${(track + stroke) / 2},${(track + stroke) / 2} 0,0,0 ${body / 2},${
      -stroke / 2
    }`,
    body > leg ? `h${leg - body} v-${3 - stroke / 2}` : "",
    "Z",
    `M-${body / 2},3`,
    `A${3 + track / 2},${3 + track / 2} 0,0,1 -${3 + (track + body) / 2},-${
      track / 2
    }`,
    `h${3 - stroke / 2}`,
    `A${(track + stroke) / 2},${(track + stroke) / 2} 0,0,0 -${body / 2},${
      stroke / 2
    }`,
    body > leg ? `h${body - leg} v${3 - stroke / 2}` : "",
    "Z",
  ].join("");

  $: d = [
    "M0,0",
    `h${body / 2}`,
    `a 1,1 0,0,1 0,${track}`,
    `h-${leg}`,
    `a 1,1 0,0,1 0,-${track}`,
    "M0,0",
    `h-${body / 2}`,
    `a 1,1 0,0,1 0,-${track}`,
    `h${leg}`,
    `a 1,1 0,0,1 0,${track}`,
  ].join("");
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="-9 -9 18 18"
  stroke-linecap="round"
>
  <g transform="rotate({rotation})">
    <path
      stroke-width="6"
      fill="transparent"
      stroke-dasharray={`${length * offset} ${length}`}
      stroke-dashoffset="0"
      stroke="#ff3e00"
      {d}
    />

    <path
      stroke-width={stroke}
      stroke="white"
      fill="transparent"
      stroke-dasharray={`${length * offset} ${length}`}
      stroke-dashoffset="0"
      {d}
    />

    {#if offset > 0.5}
      <path fill="#ff3e00" d={clip} />
    {/if}

    {#if debug}
      <path stroke-width="0.125" stroke="blue" fill="transparent" d={clip} />

      <path
        stroke-width="0.125"
        stroke="#0903"
        fill="transparent"
        d={Array.from({ length: 24 })
          .map((_, i) => `M-12,${i - 12} h24`)
          .join("")}
      />

      <path
        stroke-width="0.125"
        stroke="#0903"
        fill="transparent"
        d={Array.from({ length: 24 })
          .map((_, i) => `M${i - 12},-12 v24`)
          .join("")}
      />

      <circle cx={body / 2} cy={track / 2} r="0.5" fill="purple" />
      <circle cx={leg - body / 2} cy={-track / 2} r="0.5" fill="purple" />
      <circle
        cx={body / 2}
        cy={track / 2}
        r={(stroke + track) / 2}
        stroke="purple"
        stroke-width="0.125"
        fill="transparent"
      />
      <circle cx={-body / 2} cy={-track / 2} r="0.5" fill="purple" />
    {/if}
  </g>
</svg>
