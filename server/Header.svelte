<script>
  const items = ["One", "Two", "Three"];
</script>

<header>
  <nav>
    <ul>
      {#each items as item}
        <li>{item}</li>
      {/each}
    </ul>
  </nav>
</header>

<style>
  header {
    background-color: antiquewhite;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(3, 100px);
  }

  li {
    display: block;
    padding: 0.5rem;
  }
</style>
