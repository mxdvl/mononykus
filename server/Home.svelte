<script>
  import Header from "./Header.svelte";
  import Island from "./Island.svelte";
</script>

<body>
  <Header />
  <main>
    <h1>Mononykus: a svelte dinosaur</h1>
    <h2>Partial Hydration with Svelte and Deno</h2>

    <p>
      Working on project build in Svelte and Deno is refreshing, because the
      amount of configuration is minimal, performance is excellent and results
      are predictable.
    </p>

    <p>
      <a href="https://kit.svelte.dev">SvelteKit</a>
      has decided to go the route of full hydration, and
      <a href="https://astro.build/">Astro</a> still requires Vite and the Node ecosystem.
      This is a lightweight alternative to these approaches. This is mainly a way
      of exploring these concepts to understand what are the tradeoffs.
    </p>

    <p>
      Here, we choose to hydrate individual “islands”, similar to the approach
      taken by Astro and <a href="https://elderguide.com/tech/elderjs/"
        >Elder.js</a
      >. For example. the greeting below responds to user input on device that
      have JavaScript enabled.
    </p>

    <Island name="Name" props={{ value: "late Cretaceous friend" }} />
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
