<script>
  /** @type {number} */
  export let count;
</script>

<ul>
  {#each Array.from({ length: count }, (_, index) => index + 1) as index}
    <li>{index}</li>
  {/each}
</ul>

<style>
  ul {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 0.25rem;
    list-style-type: none;
    padding: 0;
    justify-content: space-around;
  }

  li {
    padding: 0.25rem;
    animation: fadein 120ms;
  }

  @keyframes fadein {
    from {
      transform: scale(0.6);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>
