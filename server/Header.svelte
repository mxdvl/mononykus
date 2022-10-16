<script>
  import Logo from "./Logo.svelte";

  const items = ["One", "Two", "Three"];
</script>

<header>
  <Logo colour={"darkslategrey"} />
  <h1>Mononykus</h1>

  <a href="https://github.com/mxdvl/mononykus">source code</a>
</header>

<style>
  header {
    background-color: antiquewhite;
    display: grid;
    grid-template-columns: 32px 2fr 1fr;
    gap: 0.5rem;
    align-items: center;
  }

  h1 {
    color: darkslategrey;
    font-size: 1.5rem;
    margin: 0;
  }
</style>
