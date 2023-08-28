<script>
  import Header from "../components/Header.svelte";
  import HelloFriend from "../components/HelloFriend.island.svelte";
  import Counter from "../components/Counter.island.svelte";
  import Body from "../components/Body.svelte";
  import Bee from "../components/Bee.island.svelte";
</script>

<svelte:head>
  <title>Mononykus – Deno + Svelte</title>
  <meta
    name="description"
    content="Deploy small websites built with Svelte with islands of interactivity."
  />
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

    <div class="island">
      <HelloFriend value="late Cretaceous friend" />
    </div>

    <div class="island">
      <Counter />
    </div>

    <Bee />
  </main>
</Body>

<style>
  main {
    padding: 0 3rem;
    max-width: 30em;
    margin: auto;
  }

  .island {
    border: 2px solid antiquewhite;
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin: 1rem -0.5rem;
  }
</style>
