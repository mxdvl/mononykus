<script>
  import { onMount } from "svelte/internal";
  import { spring } from "svelte/motion";

  const coords = spring({ x: 50, y: 50 });

  onMount(() => {
    coords.set({ x: 100, y: 200 }, { hard: true });

    setInterval(() => {
      coords.set(
        { x: Math.random() * 600, y: Math.random() * 600 },
        { soft: 400 }
      );
    }, 600);
  });
</script>

<aside style={`transform: translate3D(${$coords.x}px,${$coords.y}px,0);`}>
  🐝
</aside>

<style>
  aside {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>
