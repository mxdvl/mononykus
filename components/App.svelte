<script>
  import Header from "./Header.svelte";
  import Island from "./Island.svelte";
  import Counter from "./islands/Counter.svelte";
  import Name from "./islands/Name.svelte";
</script>

<body>
  <Header />
  <main>
    <h1>Title</h1>
    <h2>Subtitle</h2>
    <p>This is an interesting thing</p>

    <Island component={Counter} name="counter" props={{ count: 7 }} />
    <Island component={Counter} name="counter" props={{}} />
    <Island component={Counter} name="counter" props={{ count: 10 }} />

    <hr />

    <Island component={Name} name="name" props={{ value: "World" }} />
  </main>
</body>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  }

  main {
    max-width: 24em;
  }
</style>
