<script>
  import Header from "../components/Header.svelte";
  import HelloFriend from "../components/HelloFriend.island.svelte";
  import Counter from "../components/Counter.island.svelte";
  import Body from "../components/Body.svelte";
</script>

<svelte:head>
  <title>Mononykus – Deno + Svelte</title>
  <link rel="icon" href="/assets/favicon.ico" type="image/x-icon">
</svelte:head>

<Body>
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

    <HelloFriend value="late Cretaceous friend" />

    <Counter />
  </main>
</Body>

<style>
  main {
    padding: 0 3rem;
    max-width: 30em;
    margin: auto;
  }
</style>
