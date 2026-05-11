<script>
    import Header from "../components/Header.svelte";
    import Body from "../components/Body.svelte";

    const result = await Promise.resolve("Something");
</script>

<svelte:head>
    <title>Mononykus – Deno + Svelte (lazy)</title>
</svelte:head>

<Body>
    <Header />
    <main>
        <h1>Mononykus: supports <code>await</code> in Svelte</h1>

        <p>{result}</p>
        <!-- <p>{await Promise.resolve("This is async")}</p> -->
    </main>
</Body>

<style>
    main {
        padding: 0 3rem;
        max-width: 30em;
        margin: auto;
    }
</style>
