<script>
  export let value;
</script>

<div>
  <p>
    Well, hello there, {value}!
  </p>

  <input type="text" bind:value />

  (try changing this name)
</div>
