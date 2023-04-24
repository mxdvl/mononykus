<script>
  let opacity = 0.5;

  setInterval(() => {
    opacity = Math.random();
  }, 1200);

  console.log("hello from Orange.island.svelte");
</script>

<p style={`--opacity:${opacity}`}>🍊 naranja</p>

<style>
  p {
    opacity: var(--opacity);
    color: orange;
    transition: opacity 600ms;
  }
</style>
