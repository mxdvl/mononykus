<script>
  import Island from "./Island.svelte";

  /** @type {string} */
  export let input;
</script>

<body>
  <header>
    <h1>Image Comparison tool</h1>
    <h2>Compare various image qualities and formats</h2>
  </header>
  <main>
    <Island name="Images" props={{ input }} />
  </main>
</body>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

    margin: 0;
    padding: 0;
    background-color: #112;
    color: #ccc;
  }
  header {
    padding: 1rem;
  }

  main {
    padding: 0 1rem;
    margin: auto;
  }
</style>
