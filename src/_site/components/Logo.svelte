<script>
  export let colour = "black";
  const points = [
    [9, 3],
    [15, 5],
    [4, 12],
  ].map(([x, y]) => `${x},${y}`);

  const a = points[5];
</script>

<svg style={`--colour:${colour}`} viewBox="0 0 16 16" width={32}>
  <path
    d="
  M{points[0]}
  A20,20 0 0 0 {points[1]}
  A20,20 0 0 1 {points[2]}
  A20,20 0 0 0 {points[0]}
  Z
  "
  />
</svg>

<style>
  svg {
    fill: var(--colour);
    stroke: var(--colour);
    stroke-width: 1px;
    stroke-linejoin: round;
  }
</style>
