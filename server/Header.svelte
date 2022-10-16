<script>
  import Logo from "./Logo.svelte";

  const items = ["One", "Two", "Three"];
</script>

<header>
  <Logo colour={"darkslategrey"} />
  <h1>Mononykus</h1>
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
    display: grid;
    grid-template-columns: 32px 2fr 1fr;
    gap: 0.5rem;
  }

  h1 {
    color: darkslategrey;
    font-size: 1.5rem;
    margin: 0;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    margin: 0;
    padding: 0;
  }

  li {
    display: block;
    padding: 0.5rem;
  }
</style>
