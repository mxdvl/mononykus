<script>
  // @ts-check
  import Header from "../../components/Header.svelte";
</script>

<svelte:head><title>Mononykus – Deno + Svelte</title></svelte:head>

<body>
  <Header />

  <ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
    <li>5</li>
    <li>6</li>
  </ul>
</body>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

    margin: 2rem;
    padding: 0;
    background-color: beige;
    color: black;
  }

  ul {
    display: flex;
    gap: 2rem;
  }
</style>
