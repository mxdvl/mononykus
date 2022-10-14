<script>
  import Header from "./Header.svelte";
  import Island from "./Island.svelte";
</script>

<body>
  <Header />
  <main>
    <h1>Title</h1>
    <h2>Subtitle</h2>
    <p>This is an interesting thing</p>

    <ul>
      <li>
        <Island name="Counter" props={{ count: 7 }} />
      </li>
      <li>
        <Island name="Counter" props={{}} />
      </li>
      <li>
        <Island name="Counter" props={{ count: 10 }} />
      </li>
    </ul>

    <hr />

    <Island name="Name" props={{ value: "World" }} />
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
