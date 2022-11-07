<script>
  import Header from "./Header.svelte";
  import Island from "./Island.svelte";

  /** @type {string} */
  export let input;
</script>

<body>
  <Header />
  <main>
    <h1>The Guardian – Image Comparison tool</h1>
    <h2>Partial Hydration with Svelte and Deno</h2>

    <Island name="Images" props={{ input }} />
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
    margin: auto;
  }
</style>
