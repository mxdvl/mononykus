<script>
  // @ts-check
  import Header from "../../components/Header.svelte";
  import Counter from "../../components/Counter.island.svelte";
</script>

<svelte:head><title>Mononykus – Deno + Svelte</title></svelte:head>

<body>
  <Header />
  <main>
    <p>One level deep</p>

    <Counter />
  </main>
</body>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

    margin: 0;
    padding: 0;
    background-color: floralwhite;
    color: hsl(6, 60%, 18%);
  }

  main {
    padding: 0 3rem;
    max-width: 30em;
    margin: auto;
  }
</style>
