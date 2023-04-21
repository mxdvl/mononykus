<script>
  // @ts-check
  import Header from "../../components/Header.svelte";
  import HelloFriend from "../../components/HelloFriend.island.svelte";
  import Counter from "../../components/Counter.island.svelte";
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
    <li>7</li>
    <li>8</li>
    <li>9</li>
  </ul>
</body>

<style>
  body {
    font-family: Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif;

    margin: 9px;
    padding: 0;
    background-color: beige;
    color: black;
  }
</style>
